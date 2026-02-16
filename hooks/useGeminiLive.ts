import { useState, useRef, useEffect, useCallback } from 'react';

interface UseGeminiLiveProps {
    apiKey: string;
    onTranscript: (text: string) => void;
    onLog?: (msg: string) => void;
    onError?: (error: any) => void;
}

// Inline AudioWorklet Processor Code
// This avoids "file not found" issues and allows dynamic injection.
const WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048; 
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
        this.targetSampleRate = 16000;
        this._leftoverSamples = 0; // For downsampling accumulation
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;

        const channelData = input[0]; // Mono
        const inputSampleRate = sampleRate; // Global in AudioWorklet

        // Simple Downsampling (e.g. 48000 -> 16000)
        // We want to send chunks of 16kHz PCM.
        
        // Calculate step size
        const step = inputSampleRate / this.targetSampleRate;
        
        let i = this._leftoverSamples;
        for (; i < channelData.length; i += step) {
            const index = Math.floor(i);
            if (index >= channelData.length) break;

            const val = channelData[index];
            this.buffer[this.bufferIndex++] = val;

            if (this.bufferIndex >= this.bufferSize) {
                this.port.postMessage({
                    pcm: this.buffer.slice(0, this.bufferSize),
                    sampleRate: this.targetSampleRate
                });
                this.bufferIndex = 0;
            }
        }
        this._leftoverSamples = i - channelData.length;

        return true;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
`;

export function useGeminiLive({ apiKey, onTranscript, onLog, onError }: UseGeminiLiveProps) {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [debugInfo, setDebugInfo] = useState<{
        status: string;
        sampleRate?: number;
        chunksSent: number;
        lastError?: string;
    }>({ status: 'Idle', chunksSent: 0 });

    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksSentRef = useRef(0);

    const log = useCallback((msg: string) => {
        if (onLog) onLog(msg);
        console.log(`[GeminiLive] ${msg}`);
        setDebugInfo(prev => ({ ...prev, status: msg }));
    }, [onLog]);

    const connect = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            if (websocketRef.current?.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            if (!apiKey) {
                log("❌ ERROR: Gemini API Key is MISSING");
                setDebugInfo(prev => ({ ...prev, lastError: "API Key Missing" }));
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
                        model: "models/gemini-2.0-flash-exp",
                        generationConfig: {
                            responseModalities: ["TEXT"]
                        }
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
                    // log("Error parsing message: " + e);
                }
            };

            ws.onerror = (error) => {
                log(`❌ WebSocket Error`);
                if (onError) onError(error);
                setIsConnected(false);
                setDebugInfo(prev => ({ ...prev, lastError: "WebSocket Error" }));
                reject(error);
            };

            ws.onclose = (ev) => {
                log(`🔌 WebSocket Closed: code=${ev.code}`);
                setIsConnected(false);
                setIsStreaming(false);
                setDebugInfo(prev => ({ ...prev, status: `Closed: ${ev.code}` }));
            };

            websocketRef.current = ws;
        });
    }, [apiKey, onTranscript, log, onError]);

    const startStreaming = useCallback(async (existingStream?: MediaStream) => {
        try {
            log("🚀 Initializing Gemini Streaming (Robust Mode)...");
            chunksSentRef.current = 0;
            setDebugInfo({ status: 'Initializing...', chunksSent: 0 });

            // 1. Connect WebSocket
            await connect();

            // 2. Audio Context & Worklet
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass(); // Let it use native sample rate (e.g. 48000)
            log(`AudioContext created. Rate: ${audioContext.sampleRate}`);
            audioContextRef.current = audioContext;

            setDebugInfo(prev => ({ ...prev, sampleRate: audioContext.sampleRate }));

            // Load Worklet from Blob
            const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
            const workletUrl = URL.createObjectURL(blob);
            await audioContext.audioWorklet.addModule(workletUrl);
            log("Inline AudioWorklet loaded.");

            // 3. Get Stream
            let stream = existingStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
            }
            streamRef.current = stream;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = new AudioWorkletNode(audioContext, 'pcm-processor');

            processor.port.onmessage = (event) => {
                const { pcm } = event.data; // Float32Array

                // Convert Float32 to Int16 PCM
                const pcmData = new Int16Array(pcm.length);
                for (let i = 0; i < pcm.length; i++) {
                    const s = Math.max(-1, Math.min(1, pcm[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    const base64Audio = arrayBufferToBase64(pcmData.buffer);
                    websocketRef.current.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64Audio }]
                        }
                    }));
                    chunksSentRef.current += 1;
                    if (chunksSentRef.current % 50 === 0) {
                        setDebugInfo(prev => ({ ...prev, chunksSent: chunksSentRef.current }));
                    }
                }
            };

            source.connect(processor);
            // processor.connect(audioContext.destination); // Optional monitor

            workletNodeRef.current = processor;
            setIsStreaming(true);
            setDebugInfo(prev => ({ ...prev, status: 'Streaming' }));

        } catch (err: any) {
            log(`❌ CRITICAL FAILURE: ${err.message}`);
            if (onError) onError(err);
            setDebugInfo(prev => ({ ...prev, lastError: err.message, status: 'Failed' }));
        }
    }, [connect, log, onError]);

    const stopStreaming = useCallback(() => {
        log("Stopping streaming...");
        if (streamRef.current) {
            // Do NOT stop tracks if shared
            streamRef.current = null;
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
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
        setDebugInfo(prev => ({ ...prev, status: 'Stopped' }));
    }, [log]);

    return {
        isStreaming,
        isConnected,
        startStreaming,
        stopStreaming,
        debugInfo // expose for UI
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
