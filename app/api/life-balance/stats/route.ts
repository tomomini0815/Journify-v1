import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { calculateLifeBalanceScores } from "@/lib/lifeBalanceScoring"

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

        // 期間に基づいて日数を計算
        let days = 30
        switch (period) {
            case '1day':
                days = 1
                break
            case '1week':
                days = 7
                break
            case '1month':
                days = 30
                break
            case '6months':
                days = 180
                break
            case '1year':
                days = 365
                break
            default:
                days = 30
        }

        // 期間の開始日を計算
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // ジャーナルデータ取得
        const journals = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: startDate }
            },
            select: {
                content: true,
                tags: true,
                mood: true,
                energy: true,
                stress: true,
                sleep: true,
                activities: true,
                createdAt: true
            }
        })

        // タスクデータ取得（期間指定なし、全タスク対象）
        // ※完了したタスクの完了日でフィルタリングするのが理想的だが、
        // 現状のスキーマには完了日がないため、全タスクを取得して分析する
        const tasksData = await prisma.task.findMany({
            where: { userId: user.id },
            select: {
                text: true,
                completed: true
            }
        })

        const tasks = tasksData.map(t => ({
            title: t.text,
            completed: t.completed
        }))

        // 目標データ取得
        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            select: {
                title: true,
                progress: true
            }
        })

        // スコア計算
        const scores = calculateLifeBalanceScores(
            journals as any,
            tasks as any,
            goals as any,
            days
        )

        return NextResponse.json({
            success: true,
            scores,
            period,
            days,
            dataCount: {
                journals: journals.length,
                tasks: tasks.length,
                goals: goals.length
            }
        })

    } catch (error) {
        console.error("Error calculating life balance stats:", error)
        return NextResponse.json(
            { error: "Failed to calculate life balance stats" },
            { status: 500 }
        )
    }
}
