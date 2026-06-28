"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, Trophy, Gem, PawPrint, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Challenge {
    id: string;
    journalCreated: boolean;
    tasksCompleted: number;
    meetingCreated: boolean;
    xpEarned: number;
    completed: boolean;
    badgeEarned: string | null;
}

interface UserStats {
    level: number;
    totalCrystals: number;
    currentStreak: number;
}

export default function AdventureAndChallenges() {
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCrystalGain, setShowCrystalGain] = useState<number | null>(null);

    useEffect(() => {
        fetchChallenge();
    }, []);

    const fetchChallenge = async () => {
        try {
            const res = await fetch("/api/challenges/daily");
            if (res.ok) {
                const data = await res.json();
                setChallenge(data.challenge);
                setUserStats(data.userStats);
            }
        } catch (error) {
            console.error("Failed to fetch challenge:", error);
        } finally {
            setLoading(false);
        }
    };

    const challenges = [
        {
            id: "journal",
            title: "ジャーナルを書く",
            crystals: 20,
            completed: challenge?.journalCreated || false,
            icon: "📝"
        },
        {
            id: "tasks",
            title: "タスクを2つ完了",
            crystals: 50,
            completed: (challenge?.tasksCompleted || 0) >= 2,
            progress: challenge?.tasksCompleted || 0,
            total: 2,
            icon: "✅"
        },
        {
            id: "meeting",
            title: "議事録を1件作成",
            crystals: 30,
            completed: challenge?.meetingCreated || false,
            icon: "🎤"
        }
    ];

    const totalPossibleCrystals = 100;
    const earnedCrystals = challenge?.xpEarned || 0;
    const progress = (earnedCrystals / totalPossibleCrystals) * 100;

    if (loading) {
        return (
            <div className="dashboard-panel p-6">
                <div className="animate-pulse flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="h-6 bg-white/10 rounded w-1/3"></div>
                        <div className="h-24 bg-white/10 rounded"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-white/10 rounded w-1/3"></div>
                        <div className="h-12 bg-white/10 rounded"></div>
                        <div className="h-12 bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-panel p-5 sm:p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch relative z-10">
                {/* Left side: Pet Adventure */}
                <div className="flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                                <PawPrint className="w-4 h-4 text-emerald-300" />
                            </div>
                            <div>
                                <p className="dashboard-section-label mb-0.5">Pet Adventure</p>
                                <h3 className="text-lg font-semibold leading-tight text-white">ペットハウス</h3>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed mb-5">
                            クリスタルを集めて、かわいいペットを育てよう！お世話や冒険に行くことで絆が深まり、新しいエリアが解放されます。
                        </p>

                        {/* Pet Status Summary */}
                        {userStats && (
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
                                    <span className="text-xs text-white/50">現在のレベル</span>
                                    <span className="text-xl font-bold text-emerald-400 mt-1">Lv.{userStats.level}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] flex flex-col justify-between">
                                    <span className="text-xs text-white/50">所持クリスタル</span>
                                    <span className="text-xl font-bold text-cyan-400 mt-1 flex items-center gap-1">
                                        {userStats.totalCrystals} <Gem className="w-4 h-4 text-cyan-400 shrink-0" />
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/adventure"
                        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-400/50 hover:from-emerald-500/30 hover:to-teal-500/30 px-4 py-3 text-sm font-semibold text-emerald-200 transition-all shadow-md shadow-emerald-950/20 hover:shadow-emerald-900/30 w-full"
                    >
                        ペットハウスに行く
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Right side: Daily Challenges */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/20">
                                <Zap className="w-4 h-4 text-cyan-300" />
                            </div>
                            <div>
                                <p className="dashboard-section-label mb-0.5">Daily Quests</p>
                                <h3 className="text-lg font-semibold leading-tight text-white">今日のチャレンジ</h3>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/60 text-xs font-medium">今日の獲得クリスタル</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-cyan-300">{earnedCrystals}/{totalPossibleCrystals}</span>
                                    <Gem className="w-3.5 h-3.5 text-cyan-400" />
                                </div>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Challenges List */}
                        <div className="space-y-2">
                            {challenges.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-2.5 rounded-lg transition-all border ${item.completed
                                        ? "bg-emerald-500/10 border-emerald-500/25"
                                        : "bg-white/[0.03] border-white/[0.06]"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0">
                                            {item.completed ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-white/30" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-base shrink-0 leading-none">{item.icon}</span>
                                                <span className={`text-xs font-medium truncate ${item.completed ? "text-white/90" : "text-white/70"}`}>
                                                    {item.title}
                                                </span>
                                                {item.progress !== undefined && !item.completed && (
                                                    <span className="text-[10px] text-white/40 font-mono">
                                                        ({item.progress}/{item.total})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Gem className="w-3 h-3 text-cyan-400" />
                                                <span className={`text-xs font-bold ${item.completed ? "text-emerald-400" : "text-white/50"}`}>
                                                    +{item.crystals}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {challenge?.completed && (
                        <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                            <span className="text-emerald-300 text-xs font-medium flex items-center gap-1">
                                🏆 全チャレンジ達成ボーナス！
                            </span>
                            <span className="text-emerald-300 text-xs font-bold flex items-center gap-0.5">
                                +25 <Gem className="w-3.5 h-3.5 text-cyan-400" />
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Crystal Gain Animation */}
            <AnimatePresence>
                {showCrystalGain && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, scale: 1 }}
                        animate={{ opacity: 1, y: -50, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                    >
                        <div className="flex items-center gap-2 text-3xl font-bold text-cyan-400">
                            +{showCrystalGain} <Gem className="w-8 h-8" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
