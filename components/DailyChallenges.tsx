"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, Trophy, TrendingUp } from "lucide-react";

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
    totalXP: number;
    currentStreak: number;
}

export default function DailyChallenges() {
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showXPGain, setShowXPGain] = useState<number | null>(null);

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
            xp: 10,
            completed: challenge?.journalCreated || false,
            icon: "📝"
        },
        {
            id: "tasks",
            title: "タスクを3つ完了",
            xp: 15,
            completed: (challenge?.tasksCompleted || 0) >= 3,
            progress: challenge?.tasksCompleted || 0,
            total: 3,
            icon: "✅"
        },
        {
            id: "meeting",
            title: "議事録を1件作成",
            xp: 20,
            completed: challenge?.meetingCreated || false,
            icon: "🎤"
        }
    ];

    const totalPossibleXP = 45;
    const earnedXP = challenge?.xpEarned || 0;
    const progress = (earnedXP / totalPossibleXP) * 100;

    // XP to next level
    const xpForNextLevel = (userStats?.level || 1) * 100;
    const xpProgress = ((userStats?.totalXP || 0) % 100);
    const levelProgress = (xpProgress / 100) * 100;

    if (loading) {
        return (
            <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 backdrop-blur-xl">
                <div className="animate-pulse">
                    <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-12 bg-white/10 rounded"></div>
                        <div className="h-12 bg-white/10 rounded"></div>
                        <div className="h-12 bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 backdrop-blur-xl relative overflow-hidden">


            {/* Header */}
            <div className="relative z-10 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-xl font-bold text-white">今日のチャレンジ</h3>
                    </div>
                    {challenge?.completed && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 bg-emerald-500/20 px-3 py-1 rounded-full"
                        >
                            <Trophy className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-sm font-medium">完了！</span>
                        </motion.div>
                    )}
                </div>

                {/* Level and XP */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-white/60">レベル</span>
                        <span className="text-white font-bold">{userStats?.level || 1}</span>
                    </div>
                    <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelProgress}%` }}
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            />
                        </div>
                        <p className="text-white/40 text-xs mt-1">
                            {xpProgress}/100 XP
                        </p>
                    </div>
                </div>
            </div>

            {/* Challenges List */}
            <div className="relative z-10 space-y-3 mb-4">
                {challenges.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl transition-all ${item.completed
                            ? "bg-emerald-500/20 border border-emerald-500/30"
                            : "bg-white/5 border border-white/10"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {item.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <Circle className="w-5 h-5 text-white/40" />
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className={`font-medium ${item.completed ? "text-white" : "text-white/80"}`}>
                                            {item.title}
                                        </span>
                                    </div>
                                    {item.progress !== undefined && (
                                        <p className="text-white/60 text-sm mt-1">
                                            {item.progress}/{item.total} 完了
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className={`font-bold ${item.completed ? "text-emerald-400" : "text-white/60"}`}>
                                    +{item.xp}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">進捗</span>
                    <span className="text-white font-bold text-sm">{earnedXP}/{totalPossibleXP} XP</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    />
                </div>
                {challenge?.completed && (
                    <p className="text-emerald-400 text-sm mt-2 font-medium">
                        🏆 報酬: 限定バッジ "デイリーヒーロー" +25 XP ボーナス
                    </p>
                )}
            </div>

            {/* XP Gain Animation */}
            <AnimatePresence>
                {showXPGain && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, scale: 1 }}
                        animate={{ opacity: 1, y: -50, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <div className="text-3xl font-bold text-yellow-400">
                            +{showXPGain} XP
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
