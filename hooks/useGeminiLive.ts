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

            log(`Connecting (Key: ${apiKey ? apiKey.substring(0, 5) + '...' : 'MISSING'})...`);
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

                    if (data.setupComplete) log("✅ Setup Complete");
                    if (data.serverContent?.turnComplete) log("🏁 Turn Complete");
                    if (data.serverContent?.interrupted) log("🚫 Interrupted");
                    if (data.error) log(`❌ Server Error: ${JSON.stringify(data.error)}`);

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
                log(`🔌 WebSocket Closed: code=${ev.code}, reason=${ev.reason || 'no reason'}`);
                setIsConnected(false);
                setIsStreaming(false);
            };

            websocketRef.current = ws;
        });
    }, [apiKey, onTranscript, log, onError]);

    const startStreaming = useCallback(async (existingStream?: MediaStream) => {
        try {
            await connect();
            log("Connection confirmed. Starting media...");

            let stream = existingStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: { channelCount: 1 }
                });
            }

            streamRef.current = stream;

            const audioContext = new AudioContext(); // Native sample rate
            audioContextRef.current = audioContext;

            // Explicit resume for Android/Chrome
            if (audioContext.state === 'suspended') {
                log("Resuming AudioContext...");
                await audioContext.resume();
            }

            const sourceSampleRate = audioContext.sampleRate;
            log(`AudioContext Rate: ${sourceSampleRate}`);

            log("Loading audio-processor.js...");
            await audioContext.audioWorklet.addModule('/audio-processor.js');
            log("Audio Worklet Loaded");

            const source = audioContext.createMediaStreamSource(stream);
            const processor = new AudioWorkletNode(audioContext, 'audio-processor');
            log(`Worklet Node State: ${processor.parameters.get('isWorking') || 'started'}`);

            // Simple Downsampler State
            let bufferAccumulator = new Float32Array(0);

            processor.port.onmessage = (event) => {
                if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = event.data; // Float32Array at native rate

                // Append to accumulator
                const newBuffer = new Float32Array(bufferAccumulator.length + inputData.length);
                newBuffer.set(bufferAccumulator);
                newBuffer.set(inputData, bufferAccumulator.length);
                bufferAccumulator = newBuffer;

                // Target: 16000Hz
                const targetSampleRate = 16000;
                const ratio = sourceSampleRate / targetSampleRate;

                // Process if we have enough for at least ~20ms
                const outputLength = Math.floor(bufferAccumulator.length / ratio);

                if (outputLength > 0) {
                    const resampledData = new Int16Array(outputLength);

                    for (let i = 0; i < outputLength; i++) {
                        // Linear Interpolation
                        const originalIndex = i * ratio;
                        const index1 = Math.floor(originalIndex);
                        const index2 = Math.min(index1 + 1, bufferAccumulator.length - 1);
                        const weight = originalIndex - index1;

                        const val1 = bufferAccumulator[index1];
                        const val2 = bufferAccumulator[index2];
                        const value = val1 + (val2 - val1) * weight;

                        // Float to PCM Int16
                        const s = Math.max(-1, Math.min(1, value));
                        resampledData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }

                    bufferAccumulator = new Float32Array(0);

                    const base64Audio = arrayBufferToBase64(resampledData.buffer);

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
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            workletNodeRef.current = processor;
            setIsStreaming(true);

        } catch (err) {
            log(`Failed to start audio stream: ${err}`);
            if (onError) onError(err);
        }
    }, [connect, log, onError]);

    const stopStreaming = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
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
        connect,
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
