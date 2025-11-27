"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { HappinessChart } from "@/components/HappinessChart"
import { LifeBalanceChart } from "@/components/LifeBalanceChart"
import { motion } from "framer-motion"
import { BookOpen, Target, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    const recentJournals = [
        { id: 1, title: "朝の振り返り", date: "今日, 9:30 AM", mood: "😊" },
        { id: 2, title: "感謝リスト", date: "昨日, 8:00 PM", mood: "🙏" },
        { id: 3, title: "週次レビュー", date: "3月 3日, 2025年", mood: "💭" },
    ]

    const goals = [
        { id: 1, title: "週に3回運動する", progress: 75 },
        { id: 2, title: "今月☆2冊読書する", progress: 50 },
        { id: 3, title: "毎日瞑想する", progress: 90 },
    ]

    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold mb-2">おかえりなさい！ 👋</h1>
                <p className="text-white/60">今日のあなたの旅の様子</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={BookOpen}
                    label="今月の記録数"
                    value="12"
                    trend="+3"
                    delay={0.1}
                />
                <StatCard
                    icon={Target}
                    label="進行中の目標"
                    value="3"
                    trend="→"
                    delay={0.2}
                />
                <StatCard
                    icon={TrendingUp}
                    label="平均幸福度"
                    value="78"
                    trend="+5%"
                    delay={0.3}
                />
                <StatCard
                    icon={Calendar}
                    label="連続日数"
                    value="7"
                    trend="+2"
                    delay={0.4}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Life Balance Radar Chart */}
                <LifeBalanceChart />

                {/* Happiness Chart */}
                <HappinessChart />
            </div>

            {/* Recent Journals and Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Recent Journals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1">最近の記録</h3>
                            <p className="text-white/60 text-sm">最新のエントリー</p>
                        </div>
                        <Link
                            href="/journal"
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            すべて表示 →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentJournals.map((journal) => (
                            <div
                                key={journal.id}
                                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium">{journal.title}</h4>
                                    <span className="text-2xl">{journal.mood}</span>
                                </div>
                                <p className="text-white/60 text-sm">{journal.date}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Goal Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold mb-1">目標の進捗</h3>
                        <p className="text-white/60 text-sm">達成への道のり</p>
                    </div>
                    <Link
                        href="/goals"
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        すべて表示 →
                    </Link>
                </div>

                <div className="space-y-4">
                    {goals.map((goal) => (
                        <div key={goal.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">{goal.title}</h4>
                                <span className="text-sm text-white/60">{goal.progress}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${goal.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </DashboardLayout>
    )
}

function StatCard({ icon: Icon, label, value, trend, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-green-400">{trend}</span>
            </div>
            <div>
                <p className="text-2xl font-bold mb-1">{value}</p>
                <p className="text-sm text-white/60">{label}</p>
            </div>
        </motion.div>
    )
}
