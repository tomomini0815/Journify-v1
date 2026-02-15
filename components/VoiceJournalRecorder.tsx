"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

interface VoiceJournalRecorderProps {
    onComplete?: (journalId: string) => void;
    compact?: boolean;
    mood?: number;
    tags?: string[];
}

const DEFAULT_TAGS: string[] = [];

export default function VoiceJournalRecorder({
    onComplete,
    compact = false,
    mood = 3,
    tags = DEFAULT_TAGS
}: VoiceJournalRecorderProps) {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");

    // Local state for Mood and Tags
    const [localMood, setLocalMood] = useState(mood);
    const [localTags, setLocalTags] = useState<string[]>(tags);
    const [newTag, setNewTag] = useState("");

    // Tag Categories State
    const [activeTagCategory, setActiveTagCategory] = useState("goals");
    const [showCustomTagInput, setShowCustomTagInput] = useState(false);

    const tagCategories = {
        goals: {
            name: "🎯 目標・成長",
            tags: ["目標達成", "自己成長", "スキルアップ", "キャリア", "学習"]
        },
        emotions: {
            name: "💭 感情・気分",
            tags: ["幸せ", "感謝", "不安", "ストレス", "リラックス", "モチベーション"]
        },
        relationships: {
            name: "👥 人間関係",
            tags: ["家族", "友人", "恋愛", "仕事仲間", "新しい出会い"]
        },
        work: {
            name: "💼 仕事・勉強",
            tags: ["プロジェクト", "会議", "締め切り", "成果", "課題"]
        },
        health: {
            name: "🏃 健康・ライフスタイル",
            tags: ["運動", "食事", "睡眠", "瞑想", "ヨガ"]
        },
        hobbies: {
            name: "🎨 趣味・娯楽",
            tags: ["読書", "映画", "音楽", "アート", "ゲーム", "旅行"]
        },
        ideas: {
            name: "💡 アイデア・インスピレーション",
            tags: ["ひらめき", "計画", "夢", "創造性"]
        },
        other: {
            name: "🌟 その他",
            tags: ["日常", "振り返り", "決断", "変化", "挑戦"]
        },
        parenting: {
            name: "👶 子育て・家族",
            tags: ["反抗期", "学校", "習い事", "子供の成長", "育児の悩み", "家族の時間", "パートナー"]
        }
    };

    // Update tags for Emotions and Health
    tagCategories.emotions.tags = [...tagCategories.emotions.tags, "イライラ", "モヤモヤ", "孤独感", "焦り", "自己嫌悪"];
    tagCategories.health.tags = [...tagCategories.health.tags, "疲労", "頭痛", "体調不良", "寝不足"];

    // Sync props with local state
    useEffect(() => {
        setLocalMood(mood);
    }, [mood]);

    useEffect(() => {
        setLocalTags(tags);
    }, [tags]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | number | null>(null);
    const speechRecognitionRef = useRef<any>(null);
    const isRecordingRef = useRef(false);
    const recentFinalTextsRef = useRef<string[]>([]);
    const [isBraveBrowser, setIsBraveBrowser] = useState(false);

    const [isAndroid, setIsAndroid] = useState(false);
    const [isGeminiLiveActive, setIsGeminiLiveActive] = useState(false);

    // Diagnostics & Visualizer
    const [diagnostics, setDiagnostics] = useState<string[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        const entry = `[${time}] ${msg}`;
        console.log(entry);
        setDiagnostics(prev => [...prev.slice(-4), entry]); // Keep last 5
    };

    // Detect Brave browser and Android
    useEffect(() => {
        const checkBrowser = async () => {
            if (typeof window !== 'undefined' && (navigator as any).brave && await (navigator as any).brave.isBrave()) {
                setIsBraveBrowser(true);
                addLog('🦁 Brave browser detected');
            }

            // Detection
            const isNative = Capacitor.isNativePlatform();

            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isAndroidSystem = /android/i.test(userAgent);

            if (isAndroidSystem) {
                setIsAndroid(true);
                addLog(`🤖 Android device detected (Native: ${isNative})`);
            }
        };
        checkBrowser();
    }, []);

    // --- Device Check ---
    const checkDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const mics = devices.filter(d => d.kind === 'audioinput');
            addLog(`🎤 mics found: ${mics.length}`);
            mics.forEach(m => addLog(`   - ${m.label || 'unlabeled mic'}`));
            return mics.length > 0;
        } catch (e) {
            addLog(`❌ device check error: ${e}`);
            return false;
        }
    };

    // --- Gemini Live Hook (Android Only) ---
    const {
        isStreaming: isGeminiStreaming,
        isConnected: isGeminiConnected,
        startStreaming: startGeminiStreaming,
        stopStreaming: stopGeminiStreaming
    } = useGeminiLive({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
        onTranscript: (text) => {
            setTranscript(prev => prev + text);
        },
        onLog: addLog,
        onError: (err) => {
            addLog(`Gemini Error: ${err}`);
            setInterimTranscript("(接続エラー)");
            // Fallback to normal?
        }
    });

    // --- Visualizer Drawing ---
    const startVisualizer = (stream: MediaStream) => {
        if (!canvasRef.current) return;

        try {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                animationFrameRef.current = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] / 2;
                    ctx.fillStyle = `rgb(16, 185, 129, ${barHeight / 100})`; // Emerald color
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            };

            draw();
        } catch (e) {
            console.error("Visualizer error:", e);
        }
    };

    const stopVisualizer = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
        }
        audioContextRef.current = null;
        analyserRef.current = null;
    };

    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (speechRecognitionRef.current) {
                try { speechRecognitionRef.current.stop(); } catch (e) { }
            }
            stopVisualizer();
        };
    }, []);

    const startRecording = async () => {
        // Check for Secure Context (HTTPS or localhost)
        if (typeof window !== 'undefined' && !window.isSecureContext) {
            alert('セキュリティ上の理由により、マイクの使用はHTTPS接続またはlocalhostでのみ許可されています。')
            return
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('お使いのブラウザはマイク録音をサポートしていません。Chromeまたは最新のブラウザをご利用ください。')
            return
        }

        // --- Standard Voice Recording Path (Unified) ---
        // We use Web Speech API for real-time transcription and MediaRecorder for audio saving.
        // This follows the successful pattern in Ainance.
        try {
            addLog("🏁 startRecording requested");
            recentFinalTextsRef.current = [];

            // 1. Mandatory AudioContext Resume (for Android/Chrome browsers)
            if (audioContextRef.current) {
                await audioContextRef.current.resume();
                addLog("🔊 AudioContext resumed");
            }

            // 2. Hardware and Permission Check
            const hasMics = await checkDevices();
            if (!hasMics) {
                addLog("⚠️ No microphone hardware detected");
            }

            const isNative = Capacitor.isNativePlatform();

            // ===================================================================
            // ANDROID CHROME: Web Speech API has EXCLUSIVE mic access.
            // We CANNOT run getUserMedia + webkitSpeechRecognition at the same time.
            // Strategy: Start speech recognition FIRST, record audio AFTER stop.
            // ===================================================================
            if (isAndroid && !isNative) {
                addLog("📱 Android Chrome mode: Speech-first strategy");

                const SpeechRecognitionWeb = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechRecognitionWeb) {
                    addLog("❌ Web Speech API not available");
                    setInterimTranscript("(音声認識が利用できません)");
                    return;
                }

                const recognition = new SpeechRecognitionWeb();
                recognition.lang = 'ja-JP';
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onstart = () => addLog("🚀 web speech active (exclusive mic)");

                recognition.onresult = (event: any) => {
                    let interim = '';
                    let finalText = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            const text = event.results[i][0].transcript.trim();
                            if (text && !recentFinalTextsRef.current.includes(text)) {
                                finalText += text;
                                recentFinalTextsRef.current.push(text);
                                if (recentFinalTextsRef.current.length > 5) recentFinalTextsRef.current.shift();
                            }
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }
                    if (finalText) setTranscript(prev => prev + finalText + ' ');
                    setInterimTranscript(interim);
                };

                recognition.onerror = (event: any) => {
                    addLog(`❌ speech error: ${event.error}`);
                    // "not-allowed" means mic permission denied
                    // "aborted" means user or system stopped it
                    if (event.error === 'not-allowed') {
                        setInterimTranscript("(マイクの許可が必要です)");
                    }
                };

                recognition.onend = () => {
                    addLog("🔚 speech recognition ended");
                    // On Android: do NOT auto-restart to avoid the system notification sound.
                    // continuous:true should keep it running for most cases.
                };

                speechRecognitionRef.current = recognition;
                recognition.start();

                // Set recording state (no actual MediaRecorder on Android)
                setIsRecording(true);
                setRecordingTime(0);
                const startTime = Date.now();
                timerRef.current = window.setInterval(() => {
                    setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
                }, 1000);

                addLog("✅ Android recording started (speech-only mode)");
                return;
            }

            // ===================================================================
            // iOS / DESKTOP: getUserMedia + Web Speech API can coexist.
            // ===================================================================
            addLog("🎙️ requesting getUserMedia...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            addLog("✅ stream granted");

            // MIME Type detection
            let mimeType = "";

            if (isAndroid) {
                if (MediaRecorder.isTypeSupported("audio/mp4")) {
                    mimeType = "audio/mp4";
                } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                    mimeType = "audio/webm;codecs=opus";
                } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                    mimeType = "audio/webm";
                }
            } else {
                if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                    mimeType = "audio/webm;codecs=opus";
                } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
                    mimeType = "audio/mp4";
                }
            }

            const options = mimeType ? { mimeType } : undefined;

            try {
                const mediaRecorder = new MediaRecorder(stream, options);
                mediaRecorderRef.current = mediaRecorder;
            } catch (e) {
                mediaRecorderRef.current = new MediaRecorder(stream);
            }

            if (!mediaRecorderRef.current) {
                throw new Error("MediaRecorder failed to initialize");
            }

            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const type = mediaRecorderRef.current?.mimeType || mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());

                if (speechRecognitionRef.current) {
                    try { speechRecognitionRef.current.stop(); } catch (e) { }
                }
            };

            // Start MediaRecorder
            mediaRecorderRef.current.start(1000);

            // Start Visualizer
            startVisualizer(stream);
            addLog("📊 visualizer started");

            // Start Web Speech API (iOS/Desktop can use it alongside MediaRecorder)
            addLog("🌐 trying Web Speech API...");
            const SpeechRecognitionWeb = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionWeb) {
                try {
                    const recognition = new SpeechRecognitionWeb();
                    recognition.lang = 'ja-JP';
                    recognition.continuous = true;
                    recognition.interimResults = true;

                    recognition.onstart = () => addLog("🚀 web speech active");
                    recognition.onresult = (event: any) => {
                        let interim = '';
                        let finalText = '';
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            if (event.results[i].isFinal) {
                                const text = event.results[i][0].transcript.trim();
                                if (text && !recentFinalTextsRef.current.includes(text)) {
                                    finalText += text;
                                    recentFinalTextsRef.current.push(text);
                                    if (recentFinalTextsRef.current.length > 5) recentFinalTextsRef.current.shift();
                                }
                            } else {
                                interim += event.results[i][0].transcript;
                            }
                        }
                        if (finalText) setTranscript(prev => prev + finalText + ' ');
                        setInterimTranscript(interim);
                    };

                    recognition.onerror = (event: any) => {
                        addLog(`❌ web speech error: ${event.error}`);
                    };

                    recognition.onend = () => {
                        if (isRecordingRef.current) {
                            try { recognition.start(); } catch (e) { }
                        }
                    };

                    speechRecognitionRef.current = recognition;
                    recognition.start();
                } catch (e) {
                    addLog(`⚠️ web speech failed: ${e}`);
                }
            }

            setIsRecording(true);
            setRecordingTime(0);
            setTranscript("");
            setInterimTranscript("");

            // Timer start
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error: any) {
            console.error("Failed to start recording:", error);

            let errorMessage = "録音を開始できませんでした。";

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = "マイクへのアクセスが拒否されました。ブラウザの設定で許可してください。";
            } else if (error.name === 'NotFoundError') {
                errorMessage = "マイクが見つかりませんでした。";
            } else if (error.name === 'NotReadableError') {
                errorMessage = "マイクにアクセスできません。他のアプリが使用中の可能性があります。";
            }

            alert(errorMessage);
        }
    };

    const stopRecording = async () => {
        if (isGeminiLiveActive) {
            try {
                stopGeminiStreaming();
            } catch (e) { }
            setIsGeminiLiveActive(false);
        }

        const isNative = Capacitor.isNativePlatform();
        if (isAndroid && isNative) {
            try {
                // Handle native transcription finalization
                if (interimTranscript) {
                    setTranscript(prev => prev + interimTranscript + ' ');
                    setInterimTranscript("");
                }
                await SpeechRecognition.stop();
                SpeechRecognition.removeAllListeners();
            } catch (e) { }
        }

        // Trigger immediate ref update to prevent auto-restart race conditions in onend
        isRecordingRef.current = false;

        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            stopVisualizer();

            if (timerRef.current) {
                clearInterval(timerRef.current as any);
            }
        } else if (isRecording) {
            // Android Chrome Case (No MediaRecorder)
            setIsRecording(false);
            stopVisualizer();
            if (timerRef.current) {
                clearInterval(timerRef.current as any);
            }
            if (speechRecognitionRef.current) {
                try { speechRecognitionRef.current.stop(); } catch (e) { }
            }
        }
    };

    const processVoiceJournal = async () => {
        if (!audioBlob) return;

        setIsProcessing(true);

        try {
            // 1. 音声ファイルをアップロード
            const mimeType = audioBlob.type;
            const ext = mimeType.includes("mp4") ? "mp4" : "webm";
            const formData = new FormData();
            formData.append("file", audioBlob, `voice-journal.${ext}`);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (!uploadRes.ok) {
                let errorDetails = "Unknown error";
                try {
                    const errorData = await uploadRes.json();
                    errorDetails = errorData.error || errorData.details || JSON.stringify(errorData);
                } catch (e) {
                    errorDetails = await uploadRes.text();
                }
                throw new Error(`Failed to upload audio: ${errorDetails}`);
            }

            const uploadData = await uploadRes.json();

            // 2. 音声ジャーナルを作成（リアルタイム文字起こしを使用）
            const createRes = await fetch("/api/voice-journal/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioPath: uploadData.filepath,
                    transcript: transcript || "音声を認識できませんでした",
                    mood: localMood,
                    tags: localTags
                })
            });

            if (!createRes.ok) {
                const errorData = await createRes.json();
                console.error("Server error details:", errorData);
                throw new Error(errorData.details || errorData.error || "Failed to create voice journal");
            }

            const result = await createRes.json();

            // リセット
            setAudioBlob(null);
            setRecordingTime(0);
            setTranscript("");
            setInterimTranscript("");
            setLocalTags([]);
            setLocalMood(3);

            if (onComplete) {
                onComplete(result.id);
            }

            // 音声ジャーナルページに遷移
            router.push("/journal?tab=voice");

        } catch (error: any) {
            console.error("Failed to process voice journal:", error);
            alert(`保存に失敗しました: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const cancelRecording = () => {
        setAudioBlob(null);
        setTranscript("");
        setInterimTranscript("");
        setLocalTags(tags);
        setLocalMood(mood);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAddTag = () => {
        if (newTag.trim() && !localTags.includes(newTag.trim())) {
            setLocalTags([...localTags, newTag.trim()]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setLocalTags(localTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const toggleTag = (tag: string) => {
        if (localTags.includes(tag)) {
            setLocalTags(localTags.filter(t => t !== tag));
        } else {
            setLocalTags([...localTags, tag]);
        }
    };

    // Removed fileInputRef and handleFileUpload as per instructions.

    if (compact) {
        return (
            <div className="rounded-3xl bg-[#0F172A] border border-white/5 p-6 shadow-2xl overflow-hidden relative">
                {/* Background ambient glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10" />

                {!audioBlob && !isRecording ? (
                    // Initial State
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">音声ジャーナル</h3>
                            <p className="text-white/40 text-sm">小さな記録が、見える景色を変えていく</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={startRecording}
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all text-white"
                            >
                                <Mic className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Recording or Post-Recording State
                    <div className="space-y-6">
                        {/* Diagnostics Overlay (Android Only) */}
                        {isAndroid && diagnostics.length > 0 && (
                            <div className="bg-black/40 rounded-xl p-2 font-mono text-[9px] text-emerald-400/80 border border-emerald-500/20 mb-2">
                                {diagnostics.map((log, i) => <div key={i}>{log}</div>)}
                            </div>
                        )}
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">音声ジャーナル</h3>
                                <p className="text-white/40 text-sm">
                                    {isRecording ? "録音中..." : "小さな記録が、見える景色を変えていく"}
                                </p>
                            </div>
                            {isRecording && (
                                <div className="flex items-center gap-3">
                                    <div className="text-emerald-400 font-mono font-bold">
                                        {formatTime(recordingTime)}
                                    </div>
                                    <button
                                        onClick={stopRecording}
                                        className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all animate-pulse"
                                    >
                                        <Square className="w-5 h-5 fill-current" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Visualizer & Transcript Area */}
                        <div className="bg-white/5 rounded-2xl p-4 min-h-[120px] max-h-[220px] overflow-y-auto border border-white/5 relative">
                            {isRecording && (
                                <div className="absolute top-0 left-0 w-full h-12 overflow-hidden px-4 pt-2">
                                    <canvas ref={canvasRef} width={300} height={40} className="w-full h-full opacity-60" />
                                </div>
                            )}
                            <div className={isRecording ? "mt-12" : ""}>
                                {isRecording ? (
                                    <p className="text-white/80 leading-relaxed text-sm">
                                        {transcript}
                                        <span className="text-white/40">{interimTranscript}</span>
                                        {!transcript && !interimTranscript && (
                                            <span className="text-white/30 italic">声を待っています...</span>
                                        )}
                                    </p>
                                ) : (
                                    <>
                                        <textarea
                                            value={transcript}
                                            onChange={(e) => setTranscript(e.target.value)}
                                            placeholder="音声がここに表示されます。録音後に編集できます。"
                                            className="w-full bg-transparent text-white/80 leading-relaxed text-sm resize-none focus:outline-none placeholder:text-white/30 placeholder:italic min-h-[100px]"
                                            rows={4}
                                        />
                                        {transcript && (
                                            <span className="absolute bottom-2 right-3 text-[10px] text-white/20">✏️ 編集可能</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Post-Recording Options */}
                        {!isRecording && (audioBlob || transcript) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Mood Grid (10 options) */}
                                <div>
                                    <label className="text-sm font-bold text-white mb-3 block">今の気分は？</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[
                                            { value: 1, emoji: '🤬', label: '激怒' },
                                            { value: 2, emoji: '😞', label: '憂鬱' },
                                            { value: 3, emoji: '😫', label: 'イライラ' },
                                            { value: 4, emoji: '😢', label: '悲しい' },
                                            { value: 5, emoji: '😐', label: '普通' },
                                            { value: 6, emoji: '🙂', label: 'まあまあ' },
                                            { value: 7, emoji: '😊', label: '幸せ' },
                                            { value: 8, emoji: '😄', label: 'とても幸せ' },
                                            { value: 9, emoji: '🤩', label: 'ワクワク' },
                                            { value: 10, emoji: '🥰', label: '感謝' }
                                        ].map((item) => (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setLocalMood(item.value);
                                                }}
                                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all whitespace-nowrap ${localMood === item.value
                                                    ? "bg-emerald-500/20 border-emerald-500 text-white"
                                                    : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white/80"
                                                    }`}
                                            >
                                                <span className="text-xl mb-1">{item.emoji}</span>
                                                <span className="text-[9px] font-medium whitespace-nowrap">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="text-sm font-bold text-white mb-3 block">タグを追加</label>

                                    {/* Selected Tags Display */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {localTags.map(tag => (
                                            <span key={tag} className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg text-xs flex items-center gap-1 border border-emerald-500/30">
                                                #{tag}
                                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-white ml-1">
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Category Tabs */}
                                    <div className="flex flex-wrap gap-2 mb-3 overflow-x-auto pb-2">
                                        {Object.entries(tagCategories).map(([key, category]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setActiveTagCategory(key);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all ${activeTagCategory === key
                                                    ? 'bg-emerald-500/30 border border-emerald-500/50 text-white font-semibold'
                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                    }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tags in Active Category */}
                                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/5 h-32 overflow-y-auto content-start">
                                        {tagCategories[activeTagCategory as keyof typeof tagCategories].tags.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleTag(tag);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${localTags.includes(tag)
                                                    ? 'bg-emerald-500/30 border border-emerald-500/50 text-white'
                                                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Tag Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="カスタムタグを追加..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        />
                                        <button
                                            onClick={handleAddTag}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400"
                                        >
                                            <span className="text-xl">+</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <button
                                        onClick={cancelRecording}
                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors border border-white/10 whitespace-nowrap"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={processVoiceJournal}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                保存中...
                                            </span>
                                        ) : (
                                            "保存"
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-gradient-to-br from-cyan-600/10 to-emerald-500/10 border border-cyan-600/20 p-8 backdrop-blur-xl">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">音声ジャーナル</h3>
                <p className="text-white/60 mb-8">ワンタップで思いを記録</p>

                {/* Recording Button */}
                <div className="relative inline-block mb-6">
                    {isRecording && (
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                            className="absolute inset-0 bg-red-500 rounded-full"
                        />
                    )}

                    <motion.button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-10 ${isRecording
                            ? "bg-red-500 shadow-red-500/40"
                            : "bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-emerald-500/40"
                            }`}
                    >
                        {isRecording ? (
                            <Square className="w-12 h-12 text-white fill-current" />
                        ) : (
                            <Mic className="w-12 h-12 text-white" />
                        )}
                    </motion.button>
                </div>

                {/* Real-time Transcript Display */}
                <AnimatePresence>
                    {(isRecording || audioBlob) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-6 max-w-2xl mx-auto"
                        >
                            <div className="bg-white/5 rounded-xl p-6 max-h-48 overflow-y-auto text-left">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-white/60 text-sm">文字起こし:</h4>
                                    {!isRecording && transcript && (
                                        <span className="text-[10px] text-white/30">✏️ タップして編集</span>
                                    )}
                                </div>
                                {isRecording ? (
                                    <>
                                        <p className="text-white text-lg leading-relaxed">
                                            {transcript}
                                            <span className="text-white/40">{interimTranscript}</span>
                                        </p>
                                        {!transcript && !interimTranscript && (
                                            <p className="text-white/40 italic">話してください...</p>
                                        )}
                                    </>
                                ) : (
                                    <textarea
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        placeholder="録音後にテキストが表示されます。編集も可能です。"
                                        className="w-full bg-transparent text-white text-lg leading-relaxed resize-none focus:outline-none placeholder:text-white/30 placeholder:italic min-h-[80px]"
                                        rows={4}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording Time */}
                <AnimatePresence>
                    {isRecording && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-6"
                        >
                            <div className="text-4xl font-bold text-white mb-2">
                                {formatTime(recordingTime)}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-3 h-3 bg-red-500 rounded-full"
                                />
                                <span className="text-white/60">録音中...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Process Button */}
                <AnimatePresence>
                    {audioBlob && !isRecording && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-wrap gap-4 justify-center mt-8"
                        >
                            <button
                                onClick={cancelRecording}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={processVoiceJournal}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        処理中...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        ジャーナルを作成
                                    </span>
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Instructions */}
                {!isRecording && !audioBlob && (
                    <p className="text-white/40 text-sm">
                        マイクボタンをタップして録音開始
                    </p>
                )}
            </div>
        </div>
    );
}
