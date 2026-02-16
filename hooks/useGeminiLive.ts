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

const FALLBACK_MODELS = [
    "models/gemini-2.0-flash-exp",
    "models/gemini-2.0-flash", // Attempt fallback
];

export function useGeminiLive({ apiKey, onTranscript, onError }: UseGeminiLiveProps) { // Changed onLog to onError
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [debugInfo, setDebugInfo] = useState<{
        status: string;
        sampleRate?: number;
        chunksSent: number;
        lastError?: string;
        currentModel?: string; // New debug field
    }>({ status: 'Idle', chunksSent: 0 });

    const [modelIndex, setModelIndex] = useState(0);
    const websocketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksSentRef = useRef(0);
    const processorRef = useRef<ScriptProcessorNode | null>(null); // Fallback for iOS/Desktop (though unused in Android path)

    // Removed the `log` function as `onLog` is no longer a prop.
    // Replaced calls to `log` with `console.log` or direct `setDebugInfo` updates.

    const connect = useCallback(() => {
        return new Promise<void>((resolve, reject) => {
            if (websocketRef.current?.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            if (!apiKey) {
                console.log("❌ ERROR: Gemini API Key is MISSING");
                setDebugInfo(prev => ({ ...prev, lastError: "API Key Missing", status: 'Config Error' }));
                reject("API Key Missing");
                return;
            }

            const currentModel = FALLBACK_MODELS[modelIndex % FALLBACK_MODELS.length];
            console.log(`Connecting to Gemini API with model: ${currentModel}...`);
            setDebugInfo(prev => ({ ...prev, status: `Connecting (${currentModel})...`, currentModel }));

            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log("WebSocket Opened. Sending setup...");
                setIsConnected(true);

                // Simplify setup to defaults to avoid config errors
                const setupMsg = {
                    setup: {
                        model: currentModel
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
                    // console.log("Error parsing message: " + e);
                }
            };

            ws.onerror = (error) => {
                console.log(`❌ WebSocket Error`);
                if (onError) onError(error);
                setIsConnected(false);
                setDebugInfo(prev => ({ ...prev, lastError: "WebSocket Error" }));
                reject(error);
            };

            ws.onclose = (ev) => {
                const reason = ev.reason ? ` Reason: ${ev.reason}` : '';
                console.log(`🔌 WebSocket Closed: code=${ev.code}${reason}`);
                setIsConnected(false);
                setIsStreaming(false);

                // Retry logic for Rate Limit (429) or Service Unavailable (503) or generic 1011 (Internal Error)
                if (ev.code === 429 || ev.code === 503 || ev.code === 1011 || reason.includes("429")) {
                    console.warn("⚠️ Rate limit or server error detected. Switching model...");
                    setDebugInfo(prev => ({ ...prev, status: `RateLimited. Switching...` }));

                    // Delay before retry to avoid spamming
                    setTimeout(() => {
                        setModelIndex(prev => prev + 1);
                    }, 2000);
                } else {
                    setDebugInfo(prev => ({ ...prev, status: `Closed:${ev.code}${reason}` }));
                }
            };

            websocketRef.current = ws;
        });
    }, [apiKey, onTranscript, onError, modelIndex]); // Added modelIndex to dependencies

    const startStreaming = useCallback(async (existingStream?: MediaStream) => {
        try {
            console.log("🚀 Initializing Gemini Streaming (Robust Mode)...");
            chunksSentRef.current = 0;
            setDebugInfo(prev => ({ ...prev, status: 'Initializing...', chunksSent: 0 })); // Updated to use prev state

            // 1. Connect WebSocket
            await connect();

            // 2. Audio Context & Worklet
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass(); // Let it use native sample rate (e.g. 48000)
            console.log(`AudioContext created. Rate: ${audioContext.sampleRate}`);
            audioContextRef.current = audioContext;

            setDebugInfo(prev => ({ ...prev, sampleRate: audioContext.sampleRate }));

            // Load Worklet from Blob
            const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
            const workletUrl = URL.createObjectURL(blob);
            await audioContext.audioWorklet.addModule(workletUrl);
            console.log("Inline AudioWorklet loaded.");

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
            console.log(`❌ CRITICAL FAILURE: ${err.message}`);
            if (onError) onError(err);
            setDebugInfo(prev => ({ ...prev, lastError: err.message, status: 'Failed' }));
        }
    }, [connect, onError]); // Removed log from dependencies

    const stopStreaming = useCallback(() => {
        console.log("Stopping streaming...");
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
    }, []); // Removed log from dependencies

    // Auto-reconnect when model index changes (triggered by error fallback)
    useEffect(() => {
        if (modelIndex > 0) { // Don't auto-connect on initial mount, only on retry
            connect();
        }
    }, [modelIndex, connect]);

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
