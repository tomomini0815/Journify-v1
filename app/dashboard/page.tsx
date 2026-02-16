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
import { ActiveCompanionDisplay } from "@/components/ActiveCompanionDisplay"

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
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // 30 days ago for happiness trend
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        return await Promise.all([
            // This month count
            prisma.journalEntry.count({
                where: { userId, createdAt: { gte: thisMonthStart } },
            }),
            // Last month count (for trend)
            prisma.journalEntry.count({
                where: { userId, createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
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
            // Happiness data (last 30 days)
            prisma.journalEntry.findMany({
                where: {
                    userId,
                    mood: { gt: 0 },
                    createdAt: { gte: thirtyDaysAgo }
                },
                select: { mood: true, createdAt: true },
                orderBy: { createdAt: "asc" }
            }),
            // Previous Happiness data (30-60 days ago for trend)
            prisma.journalEntry.findMany({
                where: {
                    userId,
                    mood: { gt: 0 },
                    createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
                },
                select: { mood: true, createdAt: true },
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
    const [
        [
            thisMonthCount,
            lastMonthCount,
            ,
            journalEntries,
            prevJournalEntries,
            allJournalDates
        ],
        [goalCount]
    ] = await Promise.all([
        getCachedJournalData(userId),
        getCachedGoalData(userId)
    ])

    // Calculate streak
    let streak = 0
    if (allJournalDates.length > 0) {
        // ... (streak calculation remains same)
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
            if (!uniqueDates.has(todayStr)) checkDate = yesterday

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0]
                if (uniqueDates.has(dateStr)) {
                    streak++
                    checkDate.setDate(checkDate.getDate() - 1)
                } else break
            }
        }
    }

    // Calculate happiness average and trend
    const calculateAvg = (entries: { mood: number | null }[]) => {
        const total = entries.reduce((sum, e) => sum + (e.mood || 0), 0)
        return entries.length > 0 ? (total / entries.length / 5) * 100 : 0
    }

    const currentAvg = calculateAvg(journalEntries)
    const prevAvg = calculateAvg(prevJournalEntries)

    const happinessTrend = prevAvg > 0
        ? `${currentAvg >= prevAvg ? '+' : ''}${Math.round(((currentAvg - prevAvg) / prevAvg) * 100)}%`
        : "+0%"

    // Calculate journal count trend
    const journalDiff = thisMonthCount - lastMonthCount
    const journalTrend = `${journalDiff >= 0 ? '+' : ''}${journalDiff}`

    const stats = {
        journalCount: thisMonthCount,
        journalTrend,
        goalCount,
        streak,
        happiness: Math.round(currentAvg),
        happinessTrend,
    }

    return <DashboardStats stats={stats} />
}

async function ChartsSection({ userId }: { userId: string }) {
    try {
        const [
            [
                ,
                ,
                ,
                journalEntries,
                ,

            ],
            ,
            lifeBalanceEntries
        ] = await Promise.all([
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
                <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10 mb-8">
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
    const [, , recentJournals] = await getCachedJournalData(userId)

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
                    <Link href={`/journal/${journal.id}`} key={journal.id} className="block group">
                        <div
                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 group-hover:border-emerald-500/30"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium">{journal.title}</h4>
                                <span className="text-2xl">{getMoodEmoji(journal.mood)}</span>
                            </div>
                            <p className="text-white/60 text-sm">{new Date(journal.createdAt).toISOString().split('T')[0]}</p>
                        </div>
                    </Link>
                ))}
                {recentJournals.length === 0 && (
                    <p className="text-center text-white/40 text-sm py-4">まだジャーナルがありません</p>
                )}
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

const getCachedDashboardTasks = unstable_cache(
    async (userId: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 2); // Fetch plenty of tasks

        return await prisma.task.findMany({
            where: {
                userId,
                completed: false,
                projectId: null, // Only show daily tasks
                OR: [
                    {
                        scheduledDate: {
                            lt: nextMonth
                        }
                    },
                    { scheduledDate: null }
                ]
            },
            orderBy: { scheduledDate: 'asc' },
            take: 50 // Limit total fetched tasks
        });
    },
    ['dashboard-tasks-list'],
    { revalidate: 60, tags: ['dashboard', 'tasks'] }
)

import DashboardTaskWidget from "@/components/DashboardTaskWidget"

async function TasksSection({ userId }: { userId: string }) {
    const tasks = await getCachedDashboardTasks(userId);

    // Serialize for client component
    const serializedTasks = tasks.map((t: any) => ({
        ...t,
        priority: (['low', 'medium', 'high', 'urgent'].includes(t.priority) ? t.priority : 'medium'),
        scheduledDate: t.scheduledDate ? (typeof t.scheduledDate === 'string' ? t.scheduledDate : t.scheduledDate.toISOString()) : null,
        startDate: t.startDate ? (typeof t.startDate === 'string' ? t.startDate : t.startDate.toISOString()) : null,
        endDate: t.endDate ? (typeof t.endDate === 'string' ? t.endDate : t.endDate.toISOString()) : null,
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : t.createdAt.toISOString(),
        updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : t.updatedAt.toISOString(),
    }));

    return <DashboardTaskWidget tasks={serializedTasks} />
}

const getCachedUserProjects = unstable_cache(
    async (userId: string) => {
        return await prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, title: true }
        })
    },
    ['dashboard-user-projects'],
    { revalidate: 60, tags: ['dashboard', 'projects'] }
)

const getCachedUserSettings = unstable_cache(
    async (userId: string) => {
        const [settings, user] = await Promise.all([
            prisma.userSettings.findUnique({
                where: { userId },
                select: { showJojo: true }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { preferences: true }
            })
        ])

        const preferences = (user?.preferences as any) || {}
        const enableAdventure = preferences.enableAdventure ?? true

        return {
            showJojo: settings?.showJojo ?? true,
            enableAdventure
        }
    },
    ['dashboard-user-settings'],
    { revalidate: 60, tags: ['dashboard', 'settings', 'profile'] }
)

import VoiceRecordingSection from "@/components/VoiceRecordingSection"

async function VoiceRecordingSectionWrapper({ userId }: { userId: string }) {
    const projects = await getCachedUserProjects(userId)

    return (
        <VoiceRecordingSection
            projects={projects}
        />
    )
}


export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    const settings = await getCachedUserSettings(user.id)

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

            {/* Tasks, Goals, Recent Journals, and Daily Challenges (Reordered) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <Suspense fallback={<div className="h-48 bg-white/5 rounded-3xl animate-pulse" />}>
                    <TasksSection userId={user.id} />
                </Suspense>
                <Suspense fallback={<GoalProgressSkeleton />}>
                    <GoalProgressSection userId={user.id} />
                </Suspense>
                <Suspense fallback={<RecentJournalsSkeleton />}>
                    <RecentJournalsSection userId={user.id} />
                </Suspense>
                <DailyChallenges />
            </div>


            {/* Pet Adventure Link */}
            {(settings?.enableAdventure ?? true) && (
                <div className="mb-8">
                    <Link
                        href="/adventure"
                        className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 p-1 transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-500/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 shrink-0 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-white/5">
                                    <span className="text-5xl filter brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,1)] drop-shadow-[2px_2px_1px_rgba(0,0,0,0.9)] animate-glow-pulse">🐾</span>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                        PET ADVENTURE
                                        <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">NEW</span>
                                    </h3>
                                    <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                                        クリスタルを集めて、かわいいペットを育てよう！お世話や冒険で絆が深まります。
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 group-hover:text-emerald-300 transition-all">
                                →
                            </div>

                            {/* Mobile arrow */}
                            <div className="md:hidden flex items-center justify-end text-emerald-400 font-bold text-sm">
                                ペットハウスに行く →
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Jojo AI Mascot */}
            {(settings?.showJojo ?? true) && <Jojo userId={user.id} />}
        </DashboardLayout >
    )
}
