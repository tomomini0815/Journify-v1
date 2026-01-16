"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "ja-JP";

                recognition.onresult = (event: any) => {
                    let interim = "";
                    let final = "";

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final += event.results[i][0].transcript;
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }

                    if (final) {
                        setTranscript(prev => prev + final);
                    }
                    setInterimTranscript(interim);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setTranscript("");
            setInterimTranscript("");

            // 音声認識開始
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error("Recognition start error:", e);
                }
            }

            // タイマー開始
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Failed to start recording:", error);
            alert("マイクへのアクセスが拒否されました");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.error("Recognition stop error:", e);
                }
            }
        }
    };

    const processVoiceJournal = async () => {
        if (!audioBlob) return;

        setIsProcessing(true);

        try {
            // 1. 音声ファイルをアップロード
            const formData = new FormData();
            formData.append("file", audioBlob, "voice-journal.webm");

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
                        <button
                            onClick={startRecording}
                            className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all text-white"
                        >
                            <Mic className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    // Recording or Post-Recording State
                    <div className="space-y-6">
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

                        {/* Transcript Area */}
                        <div className="bg-white/5 rounded-2xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto border border-white/5">
                            <p className="text-white/80 leading-relaxed text-sm">
                                {transcript || interimTranscript || (
                                    <span className="text-white/30 italic">
                                        {isRecording ? "お話しください..." : "音声がここに表示されます"}
                                    </span>
                                )}
                            </p>
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
                                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${localMood === item.value
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
                                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${localTags.includes(tag)
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
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={cancelRecording}
                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors border border-white/10"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={processVoiceJournal}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
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
                        className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${isRecording
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gradient-to-br from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600"
                            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        ) : isRecording ? (
                            <Square className="w-12 h-12 text-white" />
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
                                <h4 className="text-white/60 text-sm mb-2">文字起こし:</h4>
                                <p className="text-white text-lg leading-relaxed">
                                    {transcript}
                                    <span className="text-white/40">{interimTranscript}</span>
                                </p>
                                {!transcript && !interimTranscript && isRecording && (
                                    <p className="text-white/40 italic">話してください...</p>
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
                            className="flex gap-4 justify-center mt-8"
                        >
                            <button
                                onClick={cancelRecording}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-semibold transition-all"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={processVoiceJournal}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
