"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
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

    // --- Phoenix Engine Refs & State ---
    const restartCountRef = useRef(0);
    const maxRestarts = 5;
    const isAndroidRef = useRef(false);
    const isRecordingRef = useRef(false); // Ref to track recording state avoiding closure staleness

    // Debug State (Internal Logic for Phoenix Engine)
    const [debugStatus, setDebugStatus] = useState({
        permission: 'unknown',
        isSupported: false,
        isRecording: false,
        speechState: 'idle',
        lastError: ''
    });

    const updateDebug = (key: string, value: any) => {
        setDebugStatus(prev => ({ ...prev, [key]: value }));
        // Log critical errors to console/server if needed
        if (key === 'lastError' && value) {
            console.warn(`[VoiceRecorder] Error: ${value}`);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const ua = navigator.userAgent.toLowerCase();
            isAndroidRef.current = ua.includes('android');
            updateDebug('isSupported', !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
        }
    }, []);

    // Tag Categories State
    const [activeTagCategory, setActiveTagCategory] = useState("goals");

    const tagCategories = {
        goals: {
            name: "🎯 目標・成長",
            tags: ["目標達成", "自己成長", "スキルアップ", "キャリア", "学習"]
        },
        emotions: {
            name: "💭 感情・気分",
            tags: ["幸せ", "感謝", "不安", "ストレス", "リラックス", "モチベーション", "イライラ", "モヤモヤ", "孤独感", "焦り", "自己嫌悪"]
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
            tags: ["運動", "食事", "睡眠", "瞑想", "ヨガ", "疲労", "頭痛", "体調不良", "寝不足"]
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

    // Diagnostics & Visualizer
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // --- Device Check ---
    const checkDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const mics = devices.filter(d => d.kind === 'audioinput');
            return mics.length > 0;
        } catch (e) {
            console.error("Device check error:", e);
            return false;
        }
    };

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
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);

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
                animationFrameRef.current = requestAnimationFrame(draw);
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (speechRecognitionRef.current) {
                try { speechRecognitionRef.current.onend = null; speechRecognitionRef.current.stop(); } catch (e) { }
            }
            stopVisualizer();
        };
    }, []);

    // --- Step 1: Synchronous SpeechRecognition Trigger ---
    const handleMicButtonClick = () => {
        // SpeechRecognitionの初期化と起動をここで同期的に行う
        const SpeechRecognitionWeb =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognitionWeb) {
            console.warn("Speech recognition not supported on this browser.");
            return;
        }

        const recognition = new SpeechRecognitionWeb();
        recognition.lang = 'ja-JP';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // Androidは安定性のためfalseにし、onendで手動再起動する
        recognition.continuous = isAndroidRef.current ? false : true;

        recognition.onstart = () => {
            updateDebug('speechState', 'listening');
            updateDebug('isRecording', true);
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            if (final) setTranscript(prev => prev + final + ' ');
            setInterimTranscript(interim);
        };

        recognition.onend = () => {
            updateDebug('speechState', 'ended');
            if (isRecordingRef.current) {
                // Phoenix Engine: Smart Restart
                const restartDelay = isAndroidRef.current ? 150 : 50;
                updateDebug('speechState', 'restarting (active)...');

                setTimeout(() => {
                    if (isRecordingRef.current) {
                        try {
                            recognition.start();
                            console.log("Phoenix: Restart success");
                        } catch (e: any) {
                            console.warn(`再起動失敗: ${e.message}`);
                            if (!e.message?.includes('already started')) {
                                updateDebug('lastError', `Restart: ${e.message}`);
                            }
                        }
                    }
                }, restartDelay);
            } else {
                updateDebug('isRecording', false);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') return;
            if (event.error === 'network') {
                updateDebug('lastError', 'Network error - will retry');
                return;
            }
            if (event.error === 'not-allowed') {
                alert('マイクの使用を許可してください');
                isRecordingRef.current = false;
                setIsRecording(false);
                return;
            }
            console.warn(`speech error: ${event.error}`);
            updateDebug('lastError', `${event.error}`);
        };

        // 同期的にstart()を呼ぶ
        speechRecognitionRef.current = recognition;
        isRecordingRef.current = true;
        setIsRecording(true);
        recognition.start();
    };

    const startRecording = async (options?: { isResuming?: boolean }) => {
        // Check for Secure Context (HTTPS or localhost)
        if (typeof window !== 'undefined' && !window.isSecureContext) {
            alert('セキュリティ上の理由により、マイクの使用はHTTPS接続またはlocalhostでのみ許可されています。')
            return
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('お使いのブラウザはマイク録音をサポートしていません。Chromeまたは最新のブラウザをご利用ください。')
            return
        }

        try {
            // 1. Mandatory AudioContext Resume (for Android/Chrome browsers)
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new AudioContextClass();
            }
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // 2. Hardware and Permission Check (Trigger getUserMedia for permission/playback)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // MIME Type detection
            let mimeType = "";
            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                mimeType = "audio/webm;codecs=opus";
            } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
                mimeType = "audio/mp4";
            } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                mimeType = "audio/webm";
            }

            const recorderOptions = mimeType ? { mimeType } : undefined;

            try {
                const mediaRecorder = new MediaRecorder(stream, recorderOptions);
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
                const rawBlob = new Blob(chunksRef.current, { type });
                setAudioBlob(rawBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            // Start MediaRecorder
            mediaRecorderRef.current.start(1000);

            // Start Visualizer
            startVisualizer(stream);

            if (!options?.isResuming) {
                setRecordingTime(0);
                setTranscript("");
                setInterimTranscript("");
            }

            // Timer start
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error: any) {
            console.error("Failed to start recording:", error);
            alert("録音を開始できませんでした。");
        }
    };

    const stopRecording = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current as any);
            timerRef.current = null;
        }

        // Standard stop sequence
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);
        isRecordingRef.current = false; // Sync ref
        stopVisualizer();

        if (speechRecognitionRef.current) {
            try {
                speechRecognitionRef.current.onend = null; // Prevent restart loop
                speechRecognitionRef.current.stop();
            } catch (e) { }
            speechRecognitionRef.current = null;
        }

        updateDebug('isRecording', false);
        updateDebug('speechState', 'stopped');
    };

    const resumeRecording = async () => {
        await startRecording({ isResuming: true });
    };

    const processVoiceJournal = async () => {
        if (!audioBlob) return;

        setIsProcessing(true);

        try {
            const mimeType = audioBlob.type;
            let ext = "webm";
            if (mimeType.includes("mp4")) ext = "mp4";
            else if (mimeType.includes("wav")) ext = "wav";

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

            setAudioBlob(null);
            setRecordingTime(0);
            setTranscript("");
            setInterimTranscript("");
            setLocalTags([]);
            setLocalMood(3);

            if (onComplete) {
                onComplete(result.id);
            }

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
                                onClick={() => { startRecording(); handleMicButtonClick(); }}
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all text-white"
                            >
                                <Mic className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Recording or Post-Recording State
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-white">音声ジャーナル</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                {!isRecording && (audioBlob || transcript) && (
                                    <button
                                        onClick={resumeRecording}
                                        disabled={isProcessing}
                                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/40 rounded-full transition-all disabled:opacity-40 whitespace-nowrap border border-emerald-500/30"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>録音を再開</span>
                                    </button>
                                )}
                                {isRecording && (
                                    <>
                                        <div className="text-emerald-400 font-mono font-bold text-lg">
                                            {formatTime(recordingTime)}
                                        </div>
                                        <button
                                            onClick={stopRecording}
                                            className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                        >
                                            <Square className="w-4 h-4 fill-current" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-white/40 text-xs mb-4">
                            {isRecording ? "あなたの声を聴いています..." : "小さな記録が、見える景色を変えていく"}
                        </p>

                        {/* Visualizer & Transcript Area */}
                        <div className={`bg-white/5 rounded-2xl pt-2 px-4 pb-4 min-h-[120px] max-h-[220px] overflow-y-auto border relative transition-all ${!isRecording && audioBlob ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-white/5"
                            }`}>
                            {isRecording && (
                                <div className="absolute top-0 left-0 w-full h-6 overflow-hidden px-4 pt-1">
                                    <canvas ref={canvasRef} width={300} height={20} className="w-full h-full opacity-60" />
                                </div>
                            )}
                            <div className={isRecording ? "mt-2" : ""}>
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
                        {!isRecording && audioBlob && (
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">音声ジャーナル</h3>
                    <p className="text-white/60">話すだけで、AIが記録と分析をサポート（現在は音声入力のみ）</p>
                </div>
                {!isRecording && !audioBlob && (
                    <button
                        onClick={() => { startRecording(); handleMicButtonClick(); }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all text-white"
                    >
                        <Mic className="w-8 h-8" />
                    </button>
                )}
            </div>

            {(isRecording || audioBlob) && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            {isRecording && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {!isRecording && (audioBlob || transcript) && (
                                <button
                                    onClick={resumeRecording}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/40 rounded-full transition-all disabled:opacity-40 border border-emerald-500/30"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>再開</span>
                                </button>
                            )}
                            {isRecording && (
                                <button
                                    onClick={stopRecording}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20"
                                >
                                    <Square className="w-4 h-4 fill-current" />
                                    <span>停止</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={`bg-black/20 rounded-2xl p-6 min-h-[200px] max-h-[400px] overflow-y-auto border relative transition-all ${!isRecording && audioBlob ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-white/5"
                        }`}>
                        {isRecording && (
                            <div className="absolute top-0 left-0 w-full h-8 overflow-hidden px-6 pt-2">
                                <canvas ref={canvasRef} width={600} height={30} className="w-full h-full opacity-60" />
                            </div>
                        )}
                        <div className={isRecording ? "mt-4" : ""}>
                            {isRecording ? (
                                <p className="text-white/80 leading-relaxed text-lg">
                                    {transcript}
                                    <span className="text-white/40">{interimTranscript}</span>
                                    {!transcript && !interimTranscript && (
                                        <span className="text-white/30 italic">お話しください...</span>
                                    )}
                                </p>
                            ) : (
                                <textarea
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                    placeholder="音声がここに表示されます。"
                                    className="w-full bg-transparent text-white/80 leading-relaxed text-lg resize-none focus:outline-none placeholder:text-white/30 placeholder:italic min-h-[150px]"
                                    rows={6}
                                />
                            )}
                        </div>
                    </div>

                    {!isRecording && audioBlob && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="text-lg font-bold text-white mb-4 block">今の気分は？</label>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
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
                                            onClick={() => setLocalMood(item.value)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${localMood === item.value
                                                ? "bg-emerald-500/20 border-emerald-500 text-white transform scale-105"
                                                : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white/80"
                                                }`}
                                        >
                                            <span className="text-2xl mb-1">{item.emoji}</span>
                                            <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-lg font-bold text-white mb-4 block">タグ</label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {localTags.map(tag => (
                                        <span key={tag} className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-emerald-500/30">
                                            #{tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-white">×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {Object.entries(tagCategories).map(([key, category]) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveTagCategory(key)}
                                            className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTagCategory === key
                                                ? 'bg-emerald-500/30 border border-emerald-500/50 text-white font-bold'
                                                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4 p-4 bg-white/5 rounded-2xl border border-white/5 h-40 overflow-y-auto content-start">
                                    {tagCategories[activeTagCategory as keyof typeof tagCategories].tags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${localTags.includes(tag)
                                                ? 'bg-emerald-500/30 border border-emerald-500/50 text-white'
                                                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative max-w-md">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="カスタムタグ..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 p-1"
                                    >
                                        <span className="text-2xl leading-none">+</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={cancelRecording}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={processVoiceJournal}
                                    disabled={isProcessing}
                                    className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 text-lg"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            保存中...
                                        </span>
                                    ) : (
                                        "ジャーナルを保存"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
