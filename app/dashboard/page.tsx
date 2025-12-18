import { DashboardLayout } from "@/components/DashboardLayout"
import { DashboardStats } from "@/components/DashboardStats"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { unstable_cache } from "next/cache"

import DashboardChartsWrapper from "@/components/DashboardChartsWrapper"
import { DashboardGreeting } from "@/components/DashboardGreeting"
import Jojo from "@/components/Jojo"
import DailyChallenges from "@/components/DailyChallenges"

// Revalidate every 60 seconds
export const revalidate = 60

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

// Cached data fetching functions
const getCachedJournalData = unstable_cache(
    async (userId: string) => {
        return await Promise.all([
            // Journal count
            prisma.journalEntry.count({
                where: { userId },
            }),
            // Recent journals
            prisma.journalEntry.findMany({
                where: { userId },
                select: {
                    id: true,
                    title: true,
                    mood: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                take: 3,
            }),
            // Happiness data
            prisma.journalEntry.findMany({
                where: {
                    userId,
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
                where: { userId },
                select: { createdAt: true },
                orderBy: { createdAt: 'desc' }
            })
        ])
    },
    ['dashboard-journal-data'],
    { revalidate: 60, tags: ['dashboard', 'journal'] }
)

const getCachedGoalData = unstable_cache(
    async (userId: string) => {
        return await Promise.all([
            // Goal count
            prisma.goal.count({
                where: { userId, progress: { lt: 100 } },
            }),
            // Recent goals
            prisma.goal.findMany({
                where: { userId },
                select: {
                    id: true,
                    title: true,
                    progress: true,
                },
                orderBy: { createdAt: "desc" },
                take: 3,
            })
        ])
    },
    ['dashboard-goal-data'],
    { revalidate: 60, tags: ['dashboard', 'goals'] }
)

const getCachedLifeBalanceData = unstable_cache(
    async (userId: string) => {
        return await prisma.lifeBalanceEntry.findMany({
            where: { userId },
            select: {
                category: true,
                score: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        })
    },
    ['dashboard-life-balance'],
    { revalidate: 60, tags: ['dashboard', 'life-balance'] }
)

import { Suspense } from "react"
import { StatsSkeleton, ChartsSkeleton, RecentJournalsSkeleton, GoalProgressSkeleton } from "./loading"

// ... (keep cached data fetching functions)

async function StatsSection({ userId }: { userId: string }) {
    const [[journalCount, , , allJournalDates], [goalCount]] = await Promise.all([
        getCachedJournalData(userId),
        getCachedGoalData(userId)
    ])

    // Calculate streak
    let streak = 0
    if (allJournalDates.length > 0) {
        const uniqueDates = new Set(
            allJournalDates.map(j => new Date(j.createdAt).toISOString().split('T')[0])
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

    // Calculate average happiness (need journal entries for this, fetching again but cached)
    const [, , journalEntries] = await getCachedJournalData(userId)
    const totalMood = journalEntries.reduce((sum: number, entry) => sum + (entry.mood || 0), 0)
    const averageHappiness = journalEntries.length > 0
        ? Math.round((totalMood / journalEntries.length / 5) * 100)
        : 0

    const stats = {
        journalCount,
        goalCount,
        streak,
        happiness: averageHappiness,
    }

    return <DashboardStats stats={stats} />
}

async function ChartsSection({ userId }: { userId: string }) {
    try {
        const [[, , journalEntries], , lifeBalanceEntries] = await Promise.all([
            getCachedJournalData(userId),
            getCachedGoalData(userId),
            getCachedLifeBalanceData(userId)
        ])

        // Process life balance data
        const latestLifeBalance: Record<string, number> = {}
        const categories = [
            "身体的健康", "精神的健康", "人間関係", "社会貢献",
            "仕事・キャリア", "経済的安定", "学習・成長", "自己実現", "趣味・余暇"
        ]

        categories.forEach(c => latestLifeBalance[c] = 0)

        lifeBalanceEntries.forEach((entry) => {
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
        journalEntries.forEach((entry) => {
            if (!entry.mood || !entry.createdAt) return
            const dateObj = new Date(entry.createdAt)
            if (isNaN(dateObj.getTime())) return
            const dateKey = dateObj.toISOString().split('T')[0]

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

        // Show empty state if no data
        if (happinessData.length === 0 && lifeBalanceData.every(d => d.value === 0)) {
            return (
                <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-white/60 mb-2">まだデータがありません</p>
                    <p className="text-sm text-white/40">ジャーナルを記録すると、ここにチャートが表示されます</p>
                </div>
            )
        }

        return <DashboardChartsWrapper happinessData={happinessData} lifeBalance={lifeBalanceData} />
    } catch (error) {
        console.error("ChartsSection Error:", error)
        return (
            <div className="p-4 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                データの読み込みに失敗しました
            </div>
        )
    }
}

async function RecentJournalsSection({ userId }: { userId: string }) {
    const [, recentJournals] = await getCachedJournalData(userId)

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold mb-1">最近の記録</h3>
                    <p className="text-white/60 text-sm">最新のエントリー</p>
                </div>
                <Link
                    href="/journal"
                    prefetch={true}
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
                        <p className="text-white/60 text-sm">{new Date(journal.createdAt).toISOString().split('T')[0]}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

async function GoalProgressSection({ userId }: { userId: string }) {
    const [, goals] = await getCachedGoalData(userId)

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold mb-1">目標の進捗</h3>
                    <p className="text-white/60 text-sm">達成への道のり</p>
                </div>
                <Link
                    href="/goals"
                    prefetch={true}
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
    )
}

const getCachedRecentProject = unstable_cache(
    async (userId: string) => {
        return await prisma.project.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, title: true }
        })
    },
    ['dashboard-recent-project'],
    { revalidate: 60, tags: ['dashboard', 'projects'] }
)

import VoiceRecordingSection from "@/components/VoiceRecordingSection"

async function VoiceRecordingSectionWrapper({ userId }: { userId: string }) {
    const project = await getCachedRecentProject(userId)

    return (
        <VoiceRecordingSection
            projectId={project?.id}
            projectTitle={project?.title}
        />
    )
}


export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <DashboardGreeting />

            {/* Voice Recording Section with Tab Switcher */}
            <Suspense fallback={null}>
                <VoiceRecordingSectionWrapper userId={user.id} />
            </Suspense>

            {/* Stats Cards */}
            <Suspense fallback={<StatsSkeleton />}>
                <StatsSection userId={user.id} />
            </Suspense>

            {/* Charts Grid */}
            <Suspense fallback={<ChartsSkeleton />}>
                <ChartsSection userId={user.id} />
            </Suspense>

            {/* Recent Journals, Goals, and Daily Challenges */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Suspense fallback={<RecentJournalsSkeleton />}>
                    <RecentJournalsSection userId={user.id} />
                </Suspense>
                <Suspense fallback={<GoalProgressSkeleton />}>
                    <GoalProgressSection userId={user.id} />
                </Suspense>
                <DailyChallenges />
            </div>

            {/* Year in Review Banner */}
            <div className="mb-8">
                <Link href="/year-in-review" className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 p-[1px] transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-amber-500/10">
                    <div className="relative flex items-center justify-between overflow-hidden rounded-[23px] bg-[#1a1a1a]/80 backdrop-blur-xl p-8 transition-colors group-hover:bg-[#1a1a1a]/60">
                        {/* Background effects */}
                        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl transition-all group-hover:bg-amber-500/30" />
                        <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl transition-all group-hover:bg-indigo-500/30" />

                        <div className="relative z-10 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40">
                                    📊
                                </span>
                                <h3 className="text-2xl font-bold text-white">これまでの統計詳細</h3>
                            </div>
                            <p className="max-w-xl text-white/60">
                                この1年間の成長を振り返りましょう。あなたの記録、達成、そして歩んできた道のりを美しく可視化します。
                            </p>
                        </div>

                        <div className="relative z-10 hidden items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white ring-1 ring-white/10 transition-all group-hover:bg-white/20 group-hover:ring-white/20 sm:flex">
                            <span>振り返る</span>
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Story Navigation Banner */}
            <div className="mb-8">
                <Link href="/story" className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 p-[1px] transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-amber-500/10">
                    <div className="relative flex items-center justify-between overflow-hidden rounded-[23px] bg-[#1a1a1a]/80 backdrop-blur-xl p-8 transition-colors group-hover:bg-[#1a1a1a]/60">
                        {/* Background effects */}
                        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl transition-all group-hover:bg-amber-500/30" />
                        <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl transition-all group-hover:bg-indigo-500/30" />

                        <div className="relative z-10 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40">
                                    ✨
                                </span>
                                <h3 className="text-2xl font-bold text-white">Your Epic Story</h3>
                            </div>
                            <p className="max-w-xl text-white/60">
                                あなたの一週間は、ひとつの物語です。AIが記録を紡ぎ、あなたを主人公にした英雄譚を作成します。
                            </p>
                        </div>

                        <div className="relative z-10 hidden items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white ring-1 ring-white/10 transition-all group-hover:bg-white/20 group-hover:ring-white/20 sm:flex">
                            <span>物語を読む</span>
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Jojo AI Mascot */}
            <Jojo userId={user.id} />
        </DashboardLayout>
    )
}
