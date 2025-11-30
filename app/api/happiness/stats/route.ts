import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '1month'

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 期間に基づいて開始日を計算
        let startDate: Date | undefined
        const now = new Date()

        switch (period) {
            case '1week':
                startDate = new Date(now)
                startDate.setDate(now.getDate() - 7)
                break
            case '1month':
                startDate = new Date(now)
                startDate.setMonth(now.getMonth() - 1)
                break
            case '3months':
                startDate = new Date(now)
                startDate.setMonth(now.getMonth() - 3)
                break
            case '6months':
                startDate = new Date(now)
                startDate.setMonth(now.getMonth() - 6)
                break
            case '1year':
                startDate = new Date(now)
                startDate.setFullYear(now.getFullYear() - 1)
                break
            case 'all':
                startDate = undefined
                break
            default:
                startDate = new Date(now)
                startDate.setMonth(now.getMonth() - 1)
        }

        if (startDate) {
            startDate.setHours(0, 0, 0, 0)
        }

        // ジャーナルデータ取得（気分が記録されているもののみ）
        const journals = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                mood: { not: null },
                ...(startDate ? { createdAt: { gte: startDate } } : {})
            },
            select: {
                mood: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        // 日ごとに集計
        const dailyMap = new Map<string, { total: number, count: number }>()

        journals.forEach(journal => {
            if (journal.mood === null) return

            const dateKey = journal.createdAt.toISOString().split('T')[0]

            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, { total: 0, count: 0 })
            }

            const current = dailyMap.get(dateKey)!
            current.total += journal.mood
            current.count += 1
        })

        // 配列に変換してスコア計算 (1-5 -> 0-100)
        const stats = Array.from(dailyMap.entries()).map(([date, data]) => {
            const avgMood = data.total / data.count
            // 1=0%, 2=25%, 3=50%, 4=75%, 5=100% のようにリニアに変換するか、
            // 単純に (mood / 5) * 100 にするか。
            // ユーザーの要望は「幸福度」なので、 (mood / 5) * 100 が直感的。
            // ただし、最低値が1なので、(mood - 1) / 4 * 100 の方が0-100をフルに使えるが、
            // ここではシンプルに (mood / 5) * 100 とする（1点でも20点もらえる）。
            // あるいは、LifeBalanceScoringに合わせて調整する。
            // LifeBalanceScoringでは: (totalMood / moodCount / 5) * 100 としている。

            const score = Math.round((avgMood / 5) * 100)

            return {
                date,
                score
            }
        })

        // 日付順にソート（Mapの順序は挿入順だが、念のため）
        stats.sort((a, b) => a.date.localeCompare(b.date))

        return NextResponse.json({
            success: true,
            data: stats,
            period
        })

    } catch (error) {
        console.error("Error calculating happiness stats:", error)
        return NextResponse.json(
            { error: "Failed to calculate happiness stats" },
            { status: 500 }
        )
    }
}
