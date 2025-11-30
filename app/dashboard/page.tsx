"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { HappinessChart } from "@/components/HappinessChart"
import { LifeBalanceChart } from "@/components/LifeBalanceChart"
import { motion } from "framer-motion"
import { BookOpen, Target, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Journal {
    id: string
    title: string
    mood: number
    date: string
}

interface Goal {
    id: string
    title: string
    progress: number
}

// Helper function to convert mood integer to emoji
function getMoodEmoji(mood: number | null | undefined): string {
    if (!mood) return "❓"

    switch (mood) {
        case 1:
            return "😢" // Very Sad
        case 2:
            return "😕" // Sad
        case 3:
            return "😐" // Neutral
        case 4:
            return "😊" // Happy
        case 5:
            return "😄" // Very Happy
        default:
            return "❓" // Unknown
    }
}

export default function DashboardPage() {
    const [stats, setStats] = useState({ journalCount: 0, goalCount: 0, streak: 0, happiness: 0 })
    const [recentJournals, setRecentJournals] = useState<Journal[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [lifeBalance, setLifeBalance] = useState<any[]>([])
    const [happinessData, setHappinessData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/dashboard")
                if (res.ok) {
                    const data = await res.json()
                    setStats(data.stats)
                    setRecentJournals(data.recentJournals)
                    setGoals(data.goals)
                    setLifeBalance(data.lifeBalance)
                    setHappinessData(data.happinessData)
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const [greeting, setGreeting] = useState({ title: "", message: "" })

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) {
            setGreeting({
                title: "おはようございます！ ☀️",
                message: "今日も素晴らしい1日の始まりですね。朝の積み重ねが、未来を変えます。"
            })
        } else if (hour >= 12 && hour < 18) {
            setGreeting({
                title: "こんにちは！ 🌿",
                message: "調子はいかがですか？一息ついて、後半戦も楽しみましょう。"
            })
        } else if (hour >= 18 && hour < 23) {
            setGreeting({
                title: "こんばんは！ 🌙",
                message: "今日もお疲れ様でした。1日の振り返りをして、心を整えましょう。"
            })
        } else {
            setGreeting({
                title: "夜遅くまでお疲れ様です ✨",
                message: "星が綺麗ですね。無理せず、ゆっくり休んでくださいね。"
            })
        }
    }, [])

    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{greeting.title}</h1>
                <p className="text-white/60">{greeting.message}</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={BookOpen}
                    label="今月の記録数"
                    value={stats.journalCount}
                    trend="+3"
                    delay={0.1}
                />
                <StatCard
                    icon={Target}
                    label="進行中の目標"
                    value={stats.goalCount}
                    trend="→"
                    delay={0.2}
                />
                <StatCard
                    icon={TrendingUp}
                    label="平均幸福度(過去30日)"
                    value={stats.happiness}
                    trend="+5%"
                    delay={0.3}
                />
                <StatCard
                    icon={Calendar}
                    label="連続日数"
                    value={stats.streak}
                    trend="+2"
                    delay={0.4}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Life Balance Radar Chart */}
                <LifeBalanceChart data={lifeBalance} />

                {/* Happiness Chart */}
                <HappinessChart data={happinessData} />
            </div>

            {/* Recent Journals and Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Recent Journals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1">最近の記録</h3>
                            <p className="text-white/60 text-sm">最新のエントリー</p>
                        </div>
                        <Link
                            href="/journal"
                            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
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
                                    <span className="text-2xl">{getMoodEmoji(journal.mood)}</span>
                                </div>
                                <p className="text-white/60 text-sm">{journal.date}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Goal Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1">目標の進捗</h3>
                            <p className="text-white/60 text-sm">達成への道のり</p>
                        </div>
                        <Link
                            href="/goals"
                            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
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
                                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                                        style={{ width: `${goal.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ icon: Icon, label, value, trend, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:from-white/15 hover:to-white/10 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-400" />
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
