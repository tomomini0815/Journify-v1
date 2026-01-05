"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, Heart, Meh, Frown, Tag } from "lucide-react";
import Link from "next/link";
import VoiceJournalRecorder from "@/components/VoiceJournalRecorder";

interface VoiceJournal {
    id: string;
    transcript: string;
    aiSummary: string;
    sentiment: string;
    tags: string[];
    createdAt: string;
    moodCategory?: string;
    moodDetail?: string;
    aiCoaching?: string;
}

export default function VoiceJournalPage() {
    const [journals, setJournals] = useState<VoiceJournal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            const res = await fetch("/api/voice-journal/list");
            if (res.ok) {
                const data = await res.json();
                setJournals(data.journals);
            }
        } catch (error) {
            console.error("Failed to fetch voice journals:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return <Heart className="w-5 h-5 text-emerald-400" />;
            case "negative":
                return <Frown className="w-5 h-5 text-red-400" />;
            default:
                return <Meh className="w-5 h-5 text-blue-400" />;
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "from-emerald-500/10 to-teal-500/10 border-emerald-500/20";
            case "negative":
                return "from-red-500/10 to-pink-500/10 border-red-500/20";
            default:
                return "from-blue-500/10 to-cyan-500/10 border-blue-500/20";
        }
    };

    const filteredJournals = selectedSentiment
        ? journals.filter(j => j.sentiment === selectedSentiment)
        : journals;

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        ダッシュボードに戻る
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <Mic className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-bold text-white">音声ジャーナル</h1>
                    </div>
                    <p className="text-white/60">あなたの声で記録された思い出</p>
                </div>

                {/* Recorder */}
                <div className="mb-8">
                    <VoiceJournalRecorder onComplete={fetchJournals} />
                </div>

                {/* Sentiment Filter */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setSelectedSentiment(null)}
                        className={`px-4 py-2 rounded-full transition-all ${selectedSentiment === null
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        すべて
                    </button>
                    <button
                        onClick={() => setSelectedSentiment("positive")}
                        className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${selectedSentiment === "positive"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        <Heart className="w-4 h-4" />
                        ポジティブ
                    </button>
                    <button
                        onClick={() => setSelectedSentiment("neutral")}
                        className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${selectedSentiment === "neutral"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        <Meh className="w-4 h-4" />
                        ニュートラル
                    </button>
                    <button
                        onClick={() => setSelectedSentiment("negative")}
                        className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${selectedSentiment === "negative"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        <Frown className="w-4 h-4" />
                        ネガティブ
                    </button>
                </div>

                {/* Journals List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-6 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
                                <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-white/10 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredJournals.length === 0 ? (
                    <div className="text-center py-12">
                        <Mic className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">まだ音声ジャーナルがありません</p>
                        <p className="text-white/40 text-sm mt-2">上のマイクボタンから録音を開始しましょう</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJournals.map((journal, index) => (
                            <motion.div
                                key={journal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`rounded-2xl bg-gradient-to-br ${getSentimentColor(journal.sentiment)} border p-6 backdrop-blur-xl`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            {getSentimentIcon(journal.sentiment)}
                                            <span className="text-white/60 text-sm">
                                                {new Date(journal.createdAt).toLocaleString("ja-JP")}
                                            </span>
                                        </div>
                                        {/* Display Mood Category & Detail if available */}
                                        {journal.moodCategory && (
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
                                                <span className="text-xs text-white/80">{journal.moodCategory}</span>
                                                {journal.moodDetail && (
                                                    <>
                                                        <span className="text-white/20">|</span>
                                                        <span className="text-xs font-bold text-white">{journal.moodDetail}</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Coaching Section */}
                                {journal.aiCoaching && (
                                    <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">🧞‍♂️</span>
                                            <h3 className="text-purple-300 font-bold text-sm">Jojo's Coaching</h3>
                                        </div>
                                        <p className="text-white/90 text-sm leading-relaxed">{journal.aiCoaching}</p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h3 className="text-white/60 text-xs font-semibold mb-1 uppercase tracking-wider">要約</h3>
                                    <p className="text-white/80">{journal.aiSummary}</p>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-white/60 text-xs font-semibold mb-1 uppercase tracking-wider">文字起こし</h3>
                                    <p className="text-white/60 text-sm">{journal.transcript}</p>
                                </div>

                                {journal.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {journal.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm"
                                            >
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
