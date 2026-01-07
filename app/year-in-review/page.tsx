"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Sparkles, Calendar, Target, Palette, Share2, ArrowLeft, TrendingUp, Zap, BookOpen, Star, Crown, History, Feather } from "lucide-react";
import Link from "next/link";

interface YearInReviewData {
    year: string;
    totalRecordDays: number;
    mostProductiveMonth: string;
    mostProductiveMonthActivity: number;
    mostProductiveDay: string;
    completedGoals: number;
    mostUsedEmoji: string;
    themeColor: string;
    stats: {
        totalJournals: number;
        totalTasks: number;
        totalMeetings: number;
        totalGoals: number;
        completedTasks: number;
        totalCharacters: number;
        memberSince: string;
    };
    monthlyActivity: Array<{ month: string; activity: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function StatisticsPage() {
    const [data, setData] = useState<YearInReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [animatedValues, setAnimatedValues] = useState({
        totalRecordDays: 0,
        completedGoals: 0,
        totalJournals: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalMeetings: 0,
        totalCharacters: 0
    });

    useEffect(() => {
        fetchStats();
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
                const easeOutQuad = (t: number) => t * (2 - t);
                const easedProgress = easeOutQuad(progress);

                setAnimatedValues({
                    totalRecordDays: Math.floor(data.totalRecordDays * easedProgress),
                    completedGoals: Math.floor(data.completedGoals * easedProgress),
                    totalJournals: Math.floor(data.stats.totalJournals * easedProgress),
                    totalTasks: Math.floor(data.stats.totalTasks * easedProgress),
                    completedTasks: Math.floor(data.stats.completedTasks * easedProgress),
                    totalMeetings: Math.floor(data.stats.totalMeetings * easedProgress),
                    totalCharacters: Math.floor(data.stats.totalCharacters * easedProgress)
                });

                if (currentStep >= steps) {
                    clearInterval(timer);
                    setAnimatedValues({
                        totalRecordDays: data.totalRecordDays,
                        completedGoals: data.completedGoals,
                        totalJournals: data.stats.totalJournals,
                        totalTasks: data.stats.totalTasks,
                        completedTasks: data.stats.completedTasks,
                        totalMeetings: data.stats.totalMeetings,
                        totalCharacters: data.stats.totalCharacters
                    });
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [data]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/stats/year-in-review");
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!data) return;

        const shareText = `📊 私のJournify統計\n✨ 総記録日数: ${data.totalRecordDays}日\n🎯 達成したゴール: ${data.completedGoals}個\n✍️ 総記録文字数: ${data.stats.totalCharacters}文字\n\n#Journify #MyStats`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Journify 統計詳細`,
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
                    <p className="text-white/60">統計データを分析中...</p>
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
        <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 selection:bg-emerald-500/30">
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

                    <div className="text-center relative">
                        {/* Decorative background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md"
                        >
                            <Crown className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-sm font-medium">LIFETIME STATISTICS</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                            あなたの軌跡
                        </h1>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            {new Date(data.stats.memberSince).toLocaleDateString()}から始まった、あなたの成長と活動の全記録です。
                        </p>
                    </div>
                </motion.div>

                {/* Hero Stats Grid - More dynamic layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                    {/* Main Card: Record Days */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-900/10 border border-emerald-500/20 p-8 flex flex-col justify-between min-h-[240px]"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div>
                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                <History className="w-5 h-5" />
                                <span className="font-bold tracking-wider text-sm">TOTAL DAYS</span>
                            </div>
                            <h3 className="text-white/60 text-lg mb-1">これまでの総記録日数</h3>
                        </div>
                        <div className="mt-4">
                            <p className="text-7xl md:text-8xl font-black text-white tracking-tight leading-none">
                                {animatedValues.totalRecordDays}
                                <span className="text-2xl md:text-3xl font-medium text-emerald-500/60 ml-2">Days</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Secondary: Words Count */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-900/10 border border-indigo-500/20 p-8 flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                        <div>
                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                <Feather className="w-5 h-5" />
                                <span className="font-bold tracking-wider text-sm">TOTAL WORDS</span>
                            </div>
                            <h3 className="text-white/60 text-sm">綴られた想いの数</h3>
                        </div>
                        <div className="mt-4">
                            <p className="text-4xl font-bold text-white mb-1">
                                {animatedValues.totalCharacters.toLocaleString()}
                            </p>
                            <p className="text-white/40 text-xs">文字</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Goals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
                    >
                        <Target className="w-8 h-8 text-blue-400 mb-4" />
                        <p className="text-white/40 text-xs font-bold tracking-wider mb-1">GOALS COMPLETED</p>
                        <p className="text-4xl font-bold text-white mb-2">{animatedValues.completedGoals}</p>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full" />
                        </div>
                    </motion.div>

                    {/* Tasks */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
                    >
                        <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
                        <p className="text-white/40 text-xs font-bold tracking-wider mb-1">TASK COMPLETION</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-white mb-2">{completionRate}%</p>
                            <span className="text-sm text-white/40">Rate</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                        </div>
                    </motion.div>

                    {/* Journals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/10 transition-colors"
                    >
                        <BookOpen className="w-8 h-8 text-amber-400 mb-4" />
                        <p className="text-white/40 text-xs font-bold tracking-wider mb-1">TOTAL JOURNALS</p>
                        <p className="text-4xl font-bold text-white mb-2">{animatedValues.totalJournals}</p>
                        <p className="text-white/40 text-xs">Entries recorded</p>
                    </motion.div>
                </div>


                {/* Insights Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {/* Most Productive Month */}
                    <div className="rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-bold text-lg">活動ピーク（月）</h3>
                        </div>
                        <div className="text-center py-4">
                            <p className="text-5xl font-black text-white mb-2">{data.mostProductiveMonth}</p>
                            <p className="text-white/60 text-sm">累計 {data.mostProductiveMonthActivity} 件のアクティビティ</p>
                        </div>
                    </div>

                    {/* Most Productive Day */}
                    <div className="rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-bold text-lg">活動ピーク（曜日）</h3>
                        </div>
                        <div className="text-center py-4">
                            <p className="text-5xl font-black text-white mb-2">{data.mostProductiveDay}</p>
                            <p className="text-white/60 text-sm">最も活動的な曜日</p>
                        </div>
                    </div>

                    {/* Theme Color */}
                    <div className="rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 p-6 backdrop-blur-xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <Palette className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-bold text-lg">オーラカラー</h3>
                        </div>
                        <div className="relative z-10">
                            <div className="text-2xl font-bold text-white mb-2">{data.themeColor.split('（')[0]}</div>
                            <p className="text-white/60 text-xs">{data.themeColor.split('（')[1]?.replace('）', '') || ''}</p>
                        </div>
                        {/* Color splash bg */}
                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-2xl opacity-50 bg-gradient-to-tr from-transparent to-current text-white`} style={{ color: data.themeColor.includes('青') ? '#3b82f6' : data.themeColor.includes('緑') ? '#10b981' : data.themeColor.includes('黄') ? '#eab308' : '#a855f7' }} />
                    </div>
                </motion.div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="rounded-3xl bg-[#111] border border-white/5 p-8"
                    >
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            月別アクティビティ推移
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                            color: '#fff'
                                        }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="activity" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="rounded-3xl bg-[#111] border border-white/5 p-8"
                    >
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-emerald-500" />
                            活動ウェイト
                        </h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={activityBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {activityBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Share Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center pb-12"
                >
                    <button
                        onClick={handleShare}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform"
                    >
                        <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        統計をシェアする
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
