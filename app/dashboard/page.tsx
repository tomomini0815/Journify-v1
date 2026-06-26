import { DashboardLayout } from "@/components/DashboardLayout"
import { DashboardStats } from "@/components/DashboardStats"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import { ArrowUpRight, FileText, Mic, PawPrint } from "lucide-react"
import { mockDb } from "@/lib/mock-db"

import DashboardChartsWrapper from "@/components/DashboardChartsWrapper"
import Jojo from "@/components/Jojo"
import DailyChallenges from "@/components/DailyChallenges"
import { ActiveCompanionDisplay } from "@/components/ActiveCompanionDisplay"

// Revalidate every 60 seconds
export const revalidate = 60

// Helper function to convert mood integer to emoji
// Helper function to convert mood integer to emoji
function getMoodEmoji(mood: number | null | undefined, sentiment?: string | null): string {
    // If mood is present and within expected ranges (1-5 or 1-10)
    if (mood) {
        // Handle 1-5 scale (Legacy)
        if (mood <= 5) {
            switch (mood) {
                case 1: return "😢" // Very Sad
                case 2: return "😕" // Sad
                case 3: return "😐" // Neutral
                case 4: return "😊" // Happy
                case 5: return "😄" // Very Happy
            }
        }
        // Handle 1-10 scale (Voice Journal)
        else {
            if (mood <= 2) return "😢" // 1-2
            if (mood <= 4) return "😕" // 3-4
            if (mood <= 6) return "😐" // 5-6
            if (mood <= 8) return "😊" // 7-8
            return "😄" // 9-10
        }
    }

    // Fallback to sentiment if mood is missing or we want to double check
    if (sentiment) {
        const lower = sentiment.toLowerCase()
        if (lower.includes('positive') || lower.includes('happy')) return "😊"
        if (lower.includes('negative') || lower.includes('sad')) return "😢"
        if (lower.includes('neutral')) return "😐"
    }

    return "❓" // Unknown
}

// Cached data fetching functions
const getCachedJournalData = unstable_cache(
    async (userId: string) => {
        try {
            const now = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            // 30 days ago for happiness trend
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            return await Promise.all([
                // This month count (Text)
                prisma.journalEntry.count({
                    where: { userId, createdAt: { gte: thisMonthStart } },
                }),
                // Last month count (Text) - for trend
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
                }),
                // Total Text Journals
                prisma.journalEntry.count({ where: { userId } }),
                // Total Voice Journals
                prisma.voiceJournal.count({ where: { userId } }),
                // This Month Voice Journals
                prisma.voiceJournal.count({ where: { userId, createdAt: { gte: thisMonthStart } } }),
                // All Voice Journal dates for streak
                prisma.voiceJournal.findMany({
                    where: { userId },
                    select: { createdAt: true },
                    orderBy: { createdAt: 'desc' }
                }),
                // Recent Voice Journals (with mood) for happiness stats
                prisma.voiceJournal.findMany({
                    where: {
                        userId,
                        mood: { gt: 0 },
                        createdAt: { gte: thirtyDaysAgo }
                    },
                    select: { mood: true, createdAt: true }
                }),
                // Previous Voice Journals (with mood) for trend
                prisma.voiceJournal.findMany({
                    where: {
                        userId,
                        mood: { gt: 0 },
                        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
                    },
                }),
                // Recent Voice Journals (for display) - Index 12
                prisma.voiceJournal.findMany({
                    where: { userId },
                    select: {
                        id: true,
                        aiSummary: true,
                        mood: true,
                        sentiment: true, // Add sentiment
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 3,
                })
            ])
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.warn("DB Error in getCachedJournalData, checking mock DB:", errorMsg);

            if (process.env.NODE_ENV === 'development') {
                try {
                    const mockJournals = await mockDb.journals.findMany({ where: { userId } });
                    // Calculate happiness data from mock
                    const mockHappiness = mockJournals
                        .filter((j: any) => j.mood > 0)
                        .map((j: any) => ({ mood: j.mood, createdAt: new Date(j.createdAt) }));

                    const mockDates = mockJournals.map((j: any) => ({ createdAt: new Date(j.createdAt) }));

                    console.log("Using persistent mock data for Dashboard");
                    // Mock data needs to return 13 values to match Expected Upstream indices
                    return [
                        mockJournals.length, // thisMonthTextCount
                        0, // lastMonthTextCount
                        mockJournals.slice(0, 3) as any, // recentTextJournals (findMany result)
                        mockHappiness as any, // journalEntries (current 30d)
                        [] as any, // prevJournalEntries (30-60d)
                        mockDates as any, // allJournalDates
                        mockJournals.length, // totalTextCount
                        0, // totalVoiceCount
                        0, // thisMonthVoiceCount
                        [] as any, // allVoiceDates
                        [] as any, // voiceEntries (current 30d)
                        [] as any, // prevVoiceEntries (30-60d)
                        [] as any  // recentVoiceJournals (Index 12)
                    ] as any;
                } catch (mockErr) {
                    console.error("Failed to read mock DB", mockErr);
                }
            }

            // Default Mock Data if everything fails
            return Array(13).fill([]) as any;
        }
    },
    ['dashboard-journal-data'],
    { revalidate: 60, tags: ['dashboard', 'journal'] }
)

const getCachedGoalData = unstable_cache(
    async (userId: string) => {
        try {
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
        } catch (error) {
            console.warn("DB Error in getCachedGoalData, returning mocks");
            return [
                5,
                [
                    { id: '1', title: '毎日ジャーナルを書く', progress: 60 },
                    { id: '2', title: 'ランニングを続ける', progress: 30 },
                    { id: '3', title: '読書完了', progress: 80 },
                ] as any
            ] as any
        }
    },
    ['dashboard-goal-data'],
    { revalidate: 60, tags: ['dashboard', 'goals'] }
)

const getCachedLifeBalanceData = unstable_cache(
    async (userId: string) => {
        try {
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
        } catch (error) {
            console.warn("DB Error in getCachedLifeBalanceData, returning mocks");
            return [
                { category: "身体的健康", score: 8, createdAt: new Date() },
                { category: "精神的健康", score: 7, createdAt: new Date() },
                { category: "仕事・キャリア", score: 6, createdAt: new Date() },
                { category: "学習・成長", score: 9, createdAt: new Date() },
            ] as any
        }
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
            thisMonthTextCount,
            lastMonthTextCount,
            ,
            journalEntries,
            prevJournalEntries,
            allJournalDates,
            totalTextCount,
            totalVoiceCount,
            thisMonthVoiceCount,
            allVoiceDates,
            voiceEntries,
            prevVoiceEntries
        ],
        [goalCount]
    ] = await Promise.all([
        getCachedJournalData(userId),
        getCachedGoalData(userId)
    ])

    // Combine dates for streak
    const combinedDates = [...allJournalDates, ...allVoiceDates]

    // Calculate streak
    let streak = 0
    if (combinedDates.length > 0) {
        const uniqueDates = new Set(
            combinedDates.map((j: any) => new Date(j.createdAt).toISOString().split('T')[0])
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
        const validEntries = entries.filter(e => e.mood !== null)
        const total = validEntries.reduce((sum, e) => sum + (e.mood || 0), 0)
        return validEntries.length > 0 ? (total / validEntries.length / 5) * 100 : 0
    }

    // Combine entries for happiness
    const combinedCurrentEntries = [...journalEntries, ...voiceEntries]
    const combinedPrevEntries = [...prevJournalEntries, ...prevVoiceEntries]

    const currentAvg = calculateAvg(combinedCurrentEntries)
    const prevAvg = calculateAvg(combinedPrevEntries)

    const happinessTrend = prevAvg > 0
        ? `${currentAvg >= prevAvg ? '+' : ''}${Math.round(((currentAvg - prevAvg) / prevAvg) * 100)}%`
        : "+0%"

    // Calculate Combined Total Count
    const combinedTotal = totalTextCount + totalVoiceCount

    // Calculate Combined Monthly Trend (This Month Total)
    const combinedThisMonth = thisMonthTextCount + thisMonthVoiceCount
    const journalTrend = `+${combinedThisMonth}`

    const stats = {
        journalCount: combinedTotal, // Display Total All Time
        journalTrend,                // Display "+X" (This month's additions)
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

        categories.forEach((c: string) => latestLifeBalance[c] = 0)

        lifeBalanceEntries.forEach((entry: { category: string; score: number }) => {
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
        journalEntries.forEach((entry: { mood: number | null; createdAt: string | number | Date }) => {
            if (!entry.mood || !entry.createdAt) return
            const dateObj = new Date(entry.createdAt)
            if (isNaN(dateObj.getTime())) return

            // ローカルの日付（YYYY-MM-DD）を使用
            const year = dateObj.getFullYear()
            const month = String(dateObj.getMonth() + 1).padStart(2, '0')
            const day = String(dateObj.getDate()).padStart(2, '0')
            const dateKey = `${year}-${month}-${day}`

            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, { total: 0, count: 0 })
            }
            const current = dailyMap.get(dateKey)!
            current.total += entry.mood
            current.count += 1
        })

        const happinessData = Array.from(dailyMap.entries()).map(([date, data]: [string, { total: number; count: number }]) => ({
            date,
            score: Math.round((data.total / data.count / 5) * 100)
        })).sort((a: any, b: any) => a.date.localeCompare(b.date))

        // Show empty state if no data
        if (happinessData.length === 0 && lifeBalanceData.every((d: any) => d.value === 0)) {
            return (
                <div className="dashboard-panel p-8 text-center">
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
    const data = await getCachedJournalData(userId)
    // Index 2 is recent text journals, Index 12 is recent voice journals
    const recentTextJournals = data[2]
    // @ts-ignore - Index 12 might not be inferred correctly by TS in this context without full type def update
    const recentVoiceJournals = data[12] as Array<{ id: string, aiSummary: string, mood: number | null, sentiment: string | null, createdAt: Date }>

    // Combine and sort
    // Combine and sort
    const combinedJournals = [
        ...recentTextJournals.map((j: any) => ({ ...j, type: 'text', displayTitle: j.title })),
        ...recentVoiceJournals.map((j: any) => {
            // Remove "ユーザーは" prefix if present
            let title = j.aiSummary || "音声ジャーナル";
            if (title.startsWith("ユーザーは")) {
                title = title.replace(/^ユーザーは/, "");
            }
            return { ...j, type: 'voice', displayTitle: title };
        })
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)

    return (
        <div className="dashboard-panel p-4 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="dashboard-section-label mb-1">Journal</p>
                    <h3 className="text-lg font-semibold leading-tight">最近の記録</h3>
                    <p className="text-white/60 text-sm">最新のエントリー</p>
                </div>
                <Link
                    href="/journal"
                    prefetch={true}
                    aria-label="最近の記録をすべて表示"
                    title="すべて表示"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-emerald-300 transition-colors hover:border-emerald-300/25 hover:bg-emerald-400/10 hover:text-emerald-200"
                >
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="space-y-3">
                {combinedJournals.map((journal: any) => (
                    <Link
                        href={journal.type === 'text' ? `/journal/${journal.id}` : `/voice-journal/${journal.id}`}
                        key={`${journal.type}-${journal.id}`}
                        className="block group"
                    >
                        <div
                            className="p-3 rounded-lg bg-white/[0.045] hover:bg-white/[0.075] transition-colors cursor-pointer border border-white/[0.06] group-hover:border-emerald-500/30"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {journal.type === 'text' ? (
                                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                        <Mic className="w-4 h-4 text-cyan-400 shrink-0" />
                                    )}
                                    <h4 className="font-medium truncate">{journal.displayTitle}</h4>
                                </div>
                                <span className="text-2xl shrink-0 ml-2">{getMoodEmoji(journal.mood, (journal as any).sentiment)}</span>
                            </div>
                            <p className="text-white/60 text-sm pl-6">{new Date(journal.createdAt).toISOString().split('T')[0]}</p>
                        </div>
                    </Link>
                ))}
                {combinedJournals.length === 0 && (
                    <p className="text-center text-white/40 text-sm py-4">まだ記録がありません</p>
                )}
            </div>
        </div>
    )
}

async function GoalProgressSection({ userId }: { userId: string }) {
    const [, goals] = await getCachedGoalData(userId)

    return (
        <div className="dashboard-panel p-4 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="dashboard-section-label mb-1">Goals</p>
                    <h3 className="text-lg font-semibold leading-tight">目標の進捗</h3>
                    <p className="text-white/60 text-sm">達成への道のり</p>
                </div>
                <Link
                    href="/goals"
                    prefetch={true}
                    aria-label="目標をすべて表示"
                    title="すべて表示"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-emerald-300 transition-colors hover:border-emerald-300/25 hover:bg-emerald-400/10 hover:text-emerald-200"
                >
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="space-y-4">
                {goals.map((goal: any) => (
                    <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{goal.title}</h4>
                            <span className="text-sm text-white/60">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                                style={{ width: `${goal.progress}% ` }}
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
        try {
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
        } catch (error) {
            console.warn("DB Error in getCachedDashboardTasks, returning mocks");
            return [
                { id: '1', title: '週次レビュー', priority: 'high', scheduledDate: new Date(), completed: false, createdAt: new Date(), updatedAt: new Date() },
                { id: '2', title: '買い物に行く', priority: 'medium', scheduledDate: new Date(Date.now() + 86400000), completed: false, createdAt: new Date(), updatedAt: new Date() },
            ] as any
        }
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
        try {
            return await prisma.project.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
                select: { id: true, title: true }
            })
        } catch (error) {
            console.warn("DB Error in getCachedUserProjects, returning mocks");
            return [{ id: '1', title: 'メインプロジェクト' }] as any
        }
    },
    ['dashboard-user-projects'],
    { revalidate: 60, tags: ['dashboard', 'projects'] }
)

const getCachedUserSettings = unstable_cache(
    async (userId: string) => {
        try {
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
        } catch (error) {
            console.warn("DB Error in getCachedUserSettings, returning mocks");
            return { showJojo: true, enableAdventure: true };
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
    let { data: { user } } = await supabase.auth.getUser()

    // Mock user for preview if missing
    if (!user && process.env.NODE_ENV === 'development') {
        console.log("Creating mock user for dashboard preview");
        user = { id: 'mock-user-123', email: 'preview@example.com' } as any
    }

    if (!user) {
        return null // Middleware will redirect
    }

    const settings = await getCachedUserSettings(user.id)

    const userStats = await (async () => {
        try {
            return await prisma.userStats.findUnique({
                where: { userId: user.id }
            })
        } catch (error) {
            console.warn("DB Error in fetching userStats, returning null");
            return null;
        }
    })();

    return (
        <DashboardLayout>
            <div className="dashboard-shell space-y-4">
            <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
                <div className="dashboard-panel p-4 sm:p-5">
                    <Suspense fallback={null}>
                        <VoiceRecordingSectionWrapper userId={user.id} />
                    </Suspense>
                </div>

                <div className="dashboard-panel p-4 sm:p-5">
                    <div className="mb-3">
                        <p className="dashboard-section-label mb-1">Summary</p>
                        <h2 className="text-lg font-semibold leading-tight text-white">活動サマリー</h2>
                    </div>
                    {/* Stats Cards */}
                    <Suspense fallback={<StatsSkeleton />}>
                        <StatsSection userId={user.id} />
                    </Suspense>
                </div>
            </section>

            {/* Charts Grid */}
            <Suspense fallback={<ChartsSkeleton />}>
                <ChartsSection userId={user.id} />
            </Suspense>

            {/* Tasks, Goals, Recent Journals, and Daily Challenges (Reordered) */}
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-5">
                    <Suspense fallback={<div className="h-96 dashboard-panel animate-pulse" />}>
                        <TasksSection userId={user.id} />
                    </Suspense>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:col-span-7">
                    <Suspense fallback={<GoalProgressSkeleton />}>
                        <GoalProgressSection userId={user.id} />
                    </Suspense>
                    <Suspense fallback={<RecentJournalsSkeleton />}>
                        <RecentJournalsSection userId={user.id} />
                    </Suspense>
                    <DailyChallenges />
                </div>
            </section>


            {/* Pet Adventure Link */}
            {(settings?.enableAdventure ?? true) && (
                <div>
                    <Link
                        href="/adventure"
                        className="group dashboard-panel relative block w-full overflow-hidden p-4 transition-colors hover:border-emerald-400/30"
                    >
                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 shrink-0 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center overflow-hidden">
                                    <PawPrint className="w-6 h-6 text-emerald-200" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                                        PET ADVENTURE
                                        <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">NEW</span>
                                    </h3>
                                    <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                                        クリスタルを集めて、かわいいペットを育てよう！お世話や冒険で絆が深まります。
                                    </p>
                                </div>
                            </div>

                            <div className="hidden md:flex w-9 h-9 rounded-lg bg-white/5 border border-white/10 items-center justify-center group-hover:bg-emerald-500/15 group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-all">
                                →
                            </div>

                            {/* Mobile arrow */}
                            <div className="md:hidden flex items-center justify-end text-emerald-300 font-semibold text-sm">
                                ペットハウスに行く →
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Jojo AI Mascot */}
            {(settings?.showJojo ?? true) && <Jojo userId={user.id} />}
            </div>
        </DashboardLayout>
    )
}
