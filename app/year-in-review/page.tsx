"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Sparkles, Calendar, Target, Palette, Share2, ArrowLeft, TrendingUp, Zap, BookOpen, Star } from "lucide-react";
import Link from "next/link";

interface YearInReviewData {
    year: number;
    totalRecordDays: number;
    mostProductiveMonth: string;
    mostProductiveMonthActivity: number;
    completedGoals: number;
    mostUsedEmoji: string;
    themeColor: string;
    stats: {
        totalJournals: number;
        totalTasks: number;
        totalMeetings: number;
        totalGoals: number;
        completedTasks: number;
    };
    monthlyActivity: Array<{ month: string; activity: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function YearInReviewPage() {
    const [data, setData] = useState<YearInReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [animatedValues, setAnimatedValues] = useState({
        totalRecordDays: 0,
        completedGoals: 0,
        totalJournals: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalMeetings: 0
    });

    useEffect(() => {
        fetchYearInReview();
    }, []);

    useEffect(() => {
        if (data) {
            const duration = 2000;
            const steps = 60;
            const interval = duration / steps;

            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;

                setAnimatedValues({
                    totalRecordDays: Math.floor(data.totalRecordDays * progress),
                    completedGoals: Math.floor(data.completedGoals * progress),
                    totalJournals: Math.floor(data.stats.totalJournals * progress),
                    totalTasks: Math.floor(data.stats.totalTasks * progress),
                    completedTasks: Math.floor(data.stats.completedTasks * progress),
                    totalMeetings: Math.floor(data.stats.totalMeetings * progress)
                });

                if (currentStep >= steps) {
                    clearInterval(timer);
                    setAnimatedValues({
                        totalRecordDays: data.totalRecordDays,
                        completedGoals: data.completedGoals,
                        totalJournals: data.stats.totalJournals,
                        totalTasks: data.stats.totalTasks,
                        completedTasks: data.stats.completedTasks,
                        totalMeetings: data.stats.totalMeetings
                    });
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [data]);

    const fetchYearInReview = async () => {
        try {
            const res = await fetch("/api/stats/year-in-review");
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch year in review:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!data) return;

        const shareText = `📊 ${data.year}年の私\n✨ 総記録日数: ${data.totalRecordDays}日\n🎯 達成したゴール: ${data.completedGoals}個\n${data.mostUsedEmoji} 最も使った絵文字\n\n#Journify #YearInReview`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${data.year}年の振り返り`,
                    text: shareText
                });
            } catch (error) {
                console.log("Share cancelled");
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert("クリップボードにコピーしました！");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <Sparkles className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">あなたの1年を振り返っています...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60">データの読み込みに失敗しました</p>
                    <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400 mt-4 inline-block">
                        ダッシュボードに戻る
                    </Link>
                </div>
            </div>
        );
    }

    const completionRate = data.stats.totalTasks > 0
        ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)
        : 0;

    const activityBreakdown = [
        { name: 'ジャーナル', value: data.stats.totalJournals },
        { name: 'タスク', value: data.stats.totalTasks },
        { name: '議事録', value: data.stats.totalMeetings },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Link href="/dashboard" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        ダッシュボードに戻る
                    </Link>

                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-sm font-medium">Year in Review</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            {data.year}年のあなた
                        </h1>
                        <p className="text-white/60 text-lg">この1年間の成長の軌跡</p>
                    </div>
                </motion.div>

                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-8"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        <Calendar className="w-12 h-12 text-emerald-400 mb-4" />
                        <h3 className="text-white/60 text-sm mb-2">総記録日数</h3>
                        <p className="text-5xl font-bold text-white mb-2">{animatedValues.totalRecordDays}</p>
                        <p className="text-white/40 text-sm">日間の成長記録</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-8"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                        <Target className="w-12 h-12 text-blue-400 mb-4" />
                        <h3 className="text-white/60 text-sm mb-2">達成したゴール</h3>
                        <p className="text-5xl font-bold text-white mb-2">{animatedValues.completedGoals}</p>
                        <p className="text-white/40 text-sm">個の目標を達成</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                        <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
                        <h3 className="text-white/60 text-sm mb-2">タスク完了率</h3>
                        <p className="text-5xl font-bold text-white mb-2">{completionRate}%</p>
                        <p className="text-white/40 text-sm">{animatedValues.completedTasks}/{animatedValues.totalTasks} 完了</p>
                    </motion.div>
                </div>

                {/* Insights Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
                >
                    {/* Most Productive Month */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10">
                                <Zap className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">最も生産的だった月</h3>
                                <p className="text-white/60 text-sm">あなたが最も活躍した時期</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-emerald-400">{data.mostProductiveMonth}</span>
                            <span className="text-white/60">{data.mostProductiveMonthActivity}件の活動</span>
                        </div>
                    </div>

                    {/* Theme Color */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <Palette className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">あなたのテーマカラー</h3>
                                <p className="text-white/60 text-sm">感情分析から導き出された色</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500" />
                            <span className="text-lg font-medium text-white">{data.themeColor}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Activity Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
                >
                    {/* Monthly Activity Chart */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-400" />
                            月別アクティビティ
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.monthlyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="month" stroke="#ffffff60" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#ffffff60" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #ffffff20',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="activity" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Activity Breakdown Pie */}
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-emerald-400" />
                            活動の内訳
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={activityBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {activityBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #ffffff20',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Detailed Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-400 mb-1">{animatedValues.totalJournals}</div>
                        <div className="text-white/60 text-sm">ジャーナル</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-1">{animatedValues.totalTasks}</div>
                        <div className="text-white/60 text-sm">タスク</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-1">{animatedValues.totalMeetings}</div>
                        <div className="text-white/60 text-sm">議事録</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                        <div className="text-3xl mb-1">{data.mostUsedEmoji}</div>
                        <div className="text-white/60 text-sm">よく使う絵文字</div>
                    </div>
                </motion.div>

                {/* Share Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center"
                >
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <Share2 className="w-5 h-5" />
                        この1年をシェアする
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
