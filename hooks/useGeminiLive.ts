import { useState, useRef, useEffect, useCallback } from 'react';

interface UseGeminiLiveProps {
    apiKey: string;
    onTranscript: (text: string) => void;
    onError?: (error: any) => void;
}

export function useGeminiLive({ apiKey, onTranscript, onError }: UseGeminiLiveProps) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const connect = useCallback(() => {
        if (websocketRef.current?.readyState === WebSocket.OPEN) return;

        // Construct URL with API Key
        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log("Gemini Live WebSocket Connected");
            setIsConnected(true);

            // Send initial setup message (optional but good for config)
            const setupMsg = {
                setup: {
                    model: "models/gemini-2.0-flash-exp", // Or gemini-2.0-flash-exp based on availability
                    generationConfig: {
                        responseModalities: ["TEXT"] // We only need text back for the transcript
                    }
                }
            };
            ws.send(JSON.stringify(setupMsg));
        };

        ws.onmessage = async (event) => {
            try {
                let data;
                if (event.data instanceof Blob) {
                    data = JSON.parse(await event.data.text());
                } else {
                    data = JSON.parse(event.data);
                }

                // Handle server content
                if (data.serverContent?.modelTurn?.parts) {
                    const parts = data.serverContent.modelTurn.parts;
                    for (const part of parts) {
                        if (part.text) {
                            onTranscript(part.text);
                        }
                    }
                }

                // Handle tool use or other events if needed
            } catch (e) {
                console.error("Error parsing WebSocket message:", e);
            }
        };

        ws.onerror = (error) => {
            console.error("Gemini WebSocket Error:", error);
            if (onError) onError(error);
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log("Gemini WebSocket Closed");
            setIsConnected(false);
            setIsStreaming(false);
        };

        websocketRef.current = ws;
    }, [apiKey, onTranscript, onError]);

    const startStreaming = useCallback(async (existingStream?: MediaStream) => {
        if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
            connect();
            // Wait a bit for connection? Or just fail? 
            // For simplicity, we assume connect was called or we wait for simple retry logic.
            // Better: User clicks 'Start', we connect AND start audio.
        }

        try {
            let stream = existingStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        channelCount: 1,
                        sampleRate: 16000, // Try to request 16kHz
                    }
                });
            }

            streamRef.current = stream;

            const audioContext = new AudioContext({ sampleRate: 16000 }); // Work at 16kHz if possible
            audioContextRef.current = audioContext;

            await audioContext.audioWorklet.addModule('/audio-processor.js');

            const source = audioContext.createMediaStreamSource(stream);
            const processor = new AudioWorkletNode(audioContext, 'audio-processor');

            processor.port.onmessage = (event) => {
                if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;

                const float32Data = event.data; // Float32Array

                // Convert Float32 to Int16 PCM
                const int16Data = new Int16Array(float32Data.length);
                for (let i = 0; i < float32Data.length; i++) {
                    const s = Math.max(-1, Math.min(1, float32Data[i]));
                    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Base64 encode the Int16 buffer
                // We can use a helper or FileReader. 
                // Since we are in browser, simple btoa on string is tricky for large binaries.
                // Let's use a blob -> reader approach or simple loop if small.
                const base64Audio = arrayBufferToBase64(int16Data.buffer);

                const msg = {
                    realtimeInput: {
                        mediaChunks: [
                            {
                                mimeType: "audio/pcm;rate=16000",
                                data: base64Audio
                            }
                        ]
                    }
                };

                websocketRef.current.send(JSON.stringify(msg));
            };

            source.connect(processor);
            processor.connect(audioContext.destination); // Necessary to keep the processor alive? Chrome sometimes needs this.

            workletNodeRef.current = processor;
            setIsStreaming(true);

        } catch (err) {
            console.error("Failed to start audio stream:", err);
            if (onError) onError(err);
        }
    }, [connect, onError]);

    const stopStreaming = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
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
        connect,
        startStreaming,
        stopStreaming
    };
}

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
