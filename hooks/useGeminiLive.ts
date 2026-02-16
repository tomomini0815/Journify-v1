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
    const capturedChunksRef = useRef<Int16Array[]>([]);
    const bufferAccumulatorRef = useRef<Float32Array>(new Float32Array(0));

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

    const startStreaming = useCallback(async (existingStream?: MediaStream, options?: { isResuming?: boolean }) => {
        try {
            await connect();
            log("Connection confirmed. Starting media...");

            // Only clear chunks if NOT resuming
            if (!options?.isResuming) {
                capturedChunksRef.current = [];
            } else {
                log("🔄 Resuming: appending to existing audio chunks");
            }

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

            // Resampler State via Ref
            bufferAccumulatorRef.current = new Float32Array(0);

            processor.port.onmessage = (event) => {
                const inputData = event.data; // Float32Array at native rate

                // 1. Append to accumulator
                const newBuffer = new Float32Array(bufferAccumulatorRef.current.length + inputData.length);
                newBuffer.set(bufferAccumulatorRef.current);
                newBuffer.set(inputData, bufferAccumulatorRef.current.length);
                bufferAccumulatorRef.current = newBuffer;

                // Target: 16000Hz (Fixed)
                const targetSampleRate = 16000;
                const ratio = sourceSampleRate / targetSampleRate;

                // 2. Resample logic (Required for both WebSocket and Local storage)
                const outputLength = Math.floor(bufferAccumulatorRef.current.length / ratio);

                if (outputLength > 0) {
                    const resampledData = new Int16Array(outputLength);

                    for (let i = 0; i < outputLength; i++) {
                        const originalIndex = i * ratio;
                        const index1 = Math.floor(originalIndex);
                        const index2 = Math.min(index1 + 1, bufferAccumulatorRef.current.length - 1);
                        const weight = originalIndex - index1;

                        const val1 = bufferAccumulatorRef.current[index1];
                        const val2 = bufferAccumulatorRef.current[index2];
                        const value = val1 + (val2 - val1) * weight;

                        const s = Math.max(-1, Math.min(1, value));
                        resampledData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }

                    // Keep the REMAINDER
                    const usedInputLength = Math.floor(outputLength * ratio);
                    bufferAccumulatorRef.current = bufferAccumulatorRef.current.slice(usedInputLength);

                    // 3. ALWAYS accumulate for local fallback recording
                    capturedChunksRef.current.push(new Int16Array(resampledData));

                    // 4. Send to WebSocket ONLY if established
                    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
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
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            workletNodeRef.current = processor;
            setIsStreaming(true);
            log(`🎙️ Streaming Started (bufferAccumulator managed)`);

        } catch (err) {
            log(`Failed to start audio stream: ${err}`);
            if (onError) onError(err);
        }
    }, [connect, log, onError]);

    const stopStreaming = useCallback(() => {
        // Only stop tracks if we created the stream here
        // If it was passed from outside, let the owner handle lifecycle
        if (streamRef.current) {
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

    const getCapturedAudio = useCallback(() => {
        // Flush any remaining partial buffer
        if (bufferAccumulatorRef.current.length > 0) {
            log(`🧽 Flushing remainder of buffer: ${bufferAccumulatorRef.current.length} samples`);
            const targetSampleRate = 16000;
            const sourceSampleRate = audioContextRef.current?.sampleRate || 48000;
            const ratio = sourceSampleRate / targetSampleRate;
            const outputLength = Math.floor(bufferAccumulatorRef.current.length / ratio);

            if (outputLength > 0) {
                const resampledData = new Int16Array(outputLength);
                for (let i = 0; i < outputLength; i++) {
                    const originalIndex = i * ratio;
                    const index = Math.floor(originalIndex);
                    const s = Math.max(-1, Math.min(1, bufferAccumulatorRef.current[index]));
                    resampledData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                capturedChunksRef.current.push(resampledData);
            }
            bufferAccumulatorRef.current = new Float32Array(0);
        }

        if (capturedChunksRef.current.length === 0) return null;

        // Flatten Int16Arrays
        const totalLength = capturedChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Int16Array(totalLength);
        let offset = 0;
        for (const chunk of capturedChunksRef.current) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return createWavBlob(result, 16000);
    }, [log]);

    return {
        isStreaming,
        isConnected,
        connect,
        startStreaming,
        stopStreaming,
        getCapturedAudio
    };
}

// Helper: Simple WAV Header
function createWavBlob(pcmData: Int16Array, sampleRate: number) {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + pcmData.length * 2, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 is PCM)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sampleRate * blockAlign)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channelCount * bytesPerSample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, pcmData.length * 2, true);

    // write PCM samples
    for (let i = 0; i < pcmData.length; i++) {
        view.setInt16(44 + i * 2, pcmData[i], true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
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
