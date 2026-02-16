import { useState, useRef, useEffect, useCallback } from 'react';

interface UseGeminiLiveProps {
    apiKey: string;
    onTranscript: (text: string) => void;
    onLog?: (msg: string) => void;
    onError?: (error: any) => void;
}

export function useGeminiLive({ apiKey, onTranscript, onLog, onError }: UseGeminiLiveProps) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const log = useCallback((msg: string) => {
        if (onLog) onLog(msg);
        console.log(`[GeminiLive] ${msg}`);
    }, [onLog]);

    const connect = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            if (websocketRef.current?.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            if (!apiKey) {
                log("❌ ERROR: Gemini API Key is MISSING (NEXT_PUBLIC_GEMINI_API_KEY)");
                reject("API Key Missing");
                return;
            }

            log(`Connecting to Gemini API...`);
            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

            const ws = new WebSocket(url);

            ws.onopen = () => {
                log("WebSocket Opened. Sending setup...");
                setIsConnected(true);

                const setupMsg = {
                    setup: {
                        model: "models/gemini-2.0-flash-exp"
                    }
                };
                ws.send(JSON.stringify(setupMsg));
                resolve();
            };

            ws.onmessage = async (event) => {
                try {
                    let data;
                    if (event.data instanceof Blob) {
                        data = JSON.parse(await event.data.text());
                    } else {
                        data = JSON.parse(event.data);
                    }

                    if (data.serverContent?.modelTurn?.parts) {
                        const parts = data.serverContent.modelTurn.parts;
                        for (const part of parts) {
                            if (part.text) {
                                onTranscript(part.text);
                            }
                        }
                    }
                } catch (e) {
                    log("Error parsing message: " + e);
                }
            };

            ws.onerror = (error) => {
                log(`❌ WebSocket Error`);
                if (onError) onError(error);
                setIsConnected(false);
                reject(error);
            };

            ws.onclose = (ev) => {
                log(`🔌 WebSocket Closed: code=${ev.code}`);
                setIsConnected(false);
                setIsStreaming(false);
            };

            websocketRef.current = ws;
        });
    }, [apiKey, onTranscript, log, onError]);

    const startStreaming = useCallback(async (existingStream?: MediaStream) => {
        try {
            log("🚀 Initializing Gemini Streaming...");

            // 1. Connect WebSocket
            await connect();

            // 2. Get Audio Stream if not provided
            let stream = existingStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 16000 // Request 16kHz if possible
                    }
                });
            }
            streamRef.current = stream;

            // 3. AudioContext
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass({ sampleRate: 16000 }); // Force 16kHz context
            audioContextRef.current = audioContext;

            await audioContext.audioWorklet.addModule('/audio-processor.js');

            const source = audioContext.createMediaStreamSource(stream);
            const processor = new AudioWorkletNode(audioContext, 'audio-processor');

            processor.port.onmessage = (event) => {
                const float32Data = event.data; // ArrayBuffer from Worklet

                // Convert Float32 to Int16 PCM (required by Gemini)
                const pcmData = new Int16Array(float32Data.length);
                for (let i = 0; i < float32Data.length; i++) {
                    const s = Math.max(-1, Math.min(1, float32Data[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send to WebSocket
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    const base64Audio = arrayBufferToBase64(pcmData.buffer);
                    websocketRef.current.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64Audio }]
                        }
                    }));
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination); // Keep destination to keep worklet alive? Or maybe not needed.
            // Actually, connecting to destination might cause feedback if not careful, but Worklet usually just processes.
            // Let's connect to destination but with 0 gain if needed, or just leave it. 
            // Chrome sometimes suspends processing if not connected to destination.

            workletNodeRef.current = processor;
            setIsStreaming(true);

        } catch (err) {
            log(`❌ CRITICAL FAILURE: ${err}`);
            if (onError) onError(err);
        }
    }, [connect, log, onError]);

    const stopStreaming = useCallback(() => {
        if (streamRef.current) {
            // Do NOT stop tracks if they are shared!
            // streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        if (websocketRef.current) {
            websocketRef.current.close();
            websocketRef.current = null;
        }
        setIsStreaming(false);
        setIsConnected(false);
    }, []);

    return {
        isStreaming,
        isConnected,
        startStreaming,
        stopStreaming
    };
}

// Helper
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
