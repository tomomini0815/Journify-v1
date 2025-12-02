import { DashboardLayout } from "@/components/DashboardLayout"
import { DashboardStats } from "@/components/DashboardStats"
import { DashboardCharts } from "@/components/DashboardCharts"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import Link from "next/link"

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

function getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
        return {
            title: "おはようございます! ☀️",
            message: "今日も素晴らしい1日の始まりですね。朝の積み重ねが、未来を変えます。"
        }
    } else if (hour >= 12 && hour < 18) {
        return {
            title: "こんにちは! 🌿",
            message: "調子はいかがですか?一息ついて、後半戦も楽しみましょう。"
        }
    } else if (hour >= 18 && hour < 23) {
        return {
            title: "こんばんは! 🌙",
            message: "今日もお疲れ様でした。1日の振り返りをして、心を整えましょう。"
        }
    } else {
        return {
            title: "夜遅くまでお疲れ様です ✨",
            message: "星が綺麗ですね。無理せず、ゆっくり休んでくださいね。"
        }
    }
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    // Fetch all data in parallel
    const [
        journalCount,
        goalCount,
        recentJournals,
        goals,
        lifeBalanceEntries,
        journalEntries,
        allJournalDates
    ] = await Promise.all([
        // Count queries
        prisma.journalEntry.count({
            where: { userId: user.id },
        }),
        prisma.goal.count({
            where: { userId: user.id, progress: { lt: 100 } },
        }),
        // Recent journals - only fetch needed fields
        prisma.journalEntry.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                title: true,
                mood: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 3,
        }),
        // Goals - only fetch needed fields
        prisma.goal.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                title: true,
                progress: true,
            },
            orderBy: { createdAt: "desc" },
            take: 3,
        }),
        // Life Balance entries
        prisma.lifeBalanceEntry.findMany({
            where: { userId: user.id },
            select: {
                category: true,
                score: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        }),
        // Happiness data
        prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                mood: { gt: 0 },
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            select: {
                mood: true,
                createdAt: true
            },
            orderBy: { createdAt: "asc" }
        }),
        // All journal dates for streak
        prisma.journalEntry.findMany({
            where: { userId: user.id },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' }
        })
    ])

    // Process life balance data
    const latestLifeBalance: Record<string, number> = {}
    const categories = [
        "身体的健康",
        "精神的健康",
        "人間関係",
        "社会貢献",
        "仕事・キャリア",
        "経済的安定",
        "学習・成長",
        "自己実現",
        "趣味・余暇"
    ]

    categories.forEach(c => latestLifeBalance[c] = 0)

    lifeBalanceEntries.forEach((entry: any) => {
        if (latestLifeBalance[entry.category] === 0) {
            latestLifeBalance[entry.category] = entry.score
        }
    })

    const lifeBalanceData = Object.entries(latestLifeBalance).map(([category, value]) => ({
        category,
        value
    }))

    // Calculate happiness data
    const dailyMap = new Map<string, { total: number, count: number }>()
    journalEntries.forEach((entry: any) => {
        if (!entry.mood) return
        const dateKey = entry.createdAt.toISOString().split('T')[0]
        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { total: 0, count: 0 })
        }
        const current = dailyMap.get(dateKey)!
        current.total += entry.mood
        current.count += 1
    })

    const happinessData = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        score: Math.round((data.total / data.count / 5) * 100)
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Calculate average happiness
    const totalMood = journalEntries.reduce((sum: number, entry: any) => sum + (entry.mood || 0), 0)
    const averageHappiness = journalEntries.length > 0
        ? Math.round((totalMood / journalEntries.length / 5) * 100)
        : 0

    // Calculate streak
    let streak = 0
    if (allJournalDates.length > 0) {
        const uniqueDates = new Set(
            allJournalDates.map(j => j.createdAt.toISOString().split('T')[0])
        )

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (uniqueDates.has(todayStr) || uniqueDates.has(yesterdayStr)) {
            let checkDate = new Date(today)

            if (!uniqueDates.has(todayStr)) {
                checkDate = yesterday
            }

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0]
                if (uniqueDates.has(dateStr)) {
                    streak++
                    checkDate.setDate(checkDate.getDate() - 1)
                } else {
                    break
                }
            }
        }
    }

    const stats = {
        journalCount,
        goalCount,
        streak,
        happiness: averageHappiness,
    }

    const greeting = getGreeting()

    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{greeting.title}</h1>
                <p className="text-white/60">{greeting.message}</p>
            </div>

            {/* Stats Cards */}
            <DashboardStats stats={stats} />

            {/* Charts Grid */}
            <DashboardCharts happinessData={happinessData} lifeBalance={lifeBalanceData} />

            {/* Recent Journals and Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Journals */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
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
                                <p className="text-white/60 text-sm">{journal.createdAt.toISOString().split('T')[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goal Progress */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
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
                </div>
            </div>
        </DashboardLayout>
    )
}
