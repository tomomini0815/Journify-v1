import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Execute independent queries in parallel with field selection
        const [
            journalCount,
            goalCount,
            recentJournals,
            goals,
            lifeBalanceEntries
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
            })
        ])

        const latestLifeBalance: Record<string, number> = {}
        const categories = [
            "身体的健康",    // Physical Health (Top/Foundation)
            "精神的健康",    // Mental Health
            "人間関係",      // Relationships
            "社会貢献",      // Contribution
            "仕事・キャリア", // Work
            "経済的安定",    // Money
            "学習・成長",    // Growth
            "自己実現",      // Self-Actualization
            "趣味・余暇"     // Fun
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

        // Fetch Happiness Data and streak calculation in parallel
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        thirtyDaysAgo.setHours(0, 0, 0, 0)

        const [journalEntries, allJournalDates] = await Promise.all([
            prisma.journalEntry.findMany({
                where: {
                    userId: user.id,
                    mood: { gt: 0 },
                    createdAt: { gte: thirtyDaysAgo }
                },
                select: {
                    mood: true,
                    createdAt: true
                },
                orderBy: { createdAt: "asc" }
            }),
            prisma.journalEntry.findMany({
                where: { userId: user.id },
                select: { createdAt: true },
                orderBy: { createdAt: 'desc' }
            })
        ])

        // Calculate daily average mood and convert to 0-100 score
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

        // Calculate overall average for the period
        const totalMood = journalEntries.reduce((sum: number, entry: any) => sum + (entry.mood || 0), 0)
        const averageHappiness = journalEntries.length > 0
            ? Math.round((totalMood / journalEntries.length / 5) * 100)
            : 0

        // Calculate streak (using already fetched allJournalDates)
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

            // Streak is active if there is an entry today or yesterday
            if (uniqueDates.has(todayStr) || uniqueDates.has(yesterdayStr)) {
                let checkDate = new Date(today)

                // If no entry today, start counting from yesterday
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

        // Format recent journals
        const formattedJournals = recentJournals.map((j: any) => ({
            ...j,
            date: j.createdAt.toISOString().split('T')[0]
        }))

        return NextResponse.json({
            stats: {
                journalCount,
                goalCount,
                streak,
                happiness: averageHappiness,
            },
            recentJournals: formattedJournals,
            goals,
            lifeBalance: lifeBalanceData,
            happinessData: happinessData
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        })
    } catch (error) {
        console.error("Dashboard API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
