"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, CheckCircle2 } from "lucide-react";

interface VoiceJournalRecorderProps {
    onComplete?: (journalId: string) => void;
}

export default function VoiceJournalRecorder({ onComplete }: VoiceJournalRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
                throw new Error("Failed to upload audio");
            }

            const uploadData = await uploadRes.json();

            // 2. 音声ジャーナルを作成（文字起こし、要約、感情分析）
            const createRes = await fetch("/api/voice-journal/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioPath: uploadData.filepath
                })
            });

            if (!createRes.ok) {
                throw new Error("Failed to create voice journal");
            }

            const result = await createRes.json();

            // リセット
            setAudioBlob(null);
            setRecordingTime(0);

            if (onComplete) {
                onComplete(result.id);
            }

            alert("音声ジャーナルを作成しました！");

        } catch (error) {
            console.error("Failed to process voice journal:", error);
            alert("音声ジャーナルの作成に失敗しました");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8 backdrop-blur-xl">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">音声ジャーナル</h3>
                <p className="text-white/60 mb-8">ワンタップで思いを記録</p>

                {/* Recording Button */}
                <div className="relative inline-block mb-6">
                    {/* Pulse animation when recording */}
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
                                : "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
                        >
                            <button
                                onClick={processVoiceJournal}
                                disabled={isProcessing}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
