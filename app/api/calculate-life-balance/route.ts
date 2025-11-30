import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { calculateLifeBalanceScores } from "@/lib/lifeBalanceScoring"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 過去30日のデータを取得
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // ジャーナルデータ取得
        const journals = await prisma.journalEntry.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: thirtyDaysAgo }
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

        // タスクデータ取得
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
            goals as any
        )

        // カテゴリー名マッピング
        const categoryMapping = {
            physical: "身体的健康",
            mental: "精神的健康",
            relationships: "人間関係",
            social: "社会貢献",
            career: "仕事・キャリア",
            financial: "経済的安定",
            learning: "学習・成長",
            selfActualization: "自己実現",
            leisure: "趣味・余暇"
        }

        // データベースに保存
        const savePromises = Object.entries(scores).map(([key, value]) => {
            const category = categoryMapping[key as keyof typeof categoryMapping]
            return prisma.lifeBalanceEntry.create({
                data: {
                    userId: user.id,
                    category,
                    score: value
                }
            })
        })

        await Promise.all(savePromises)

        return NextResponse.json({
            success: true,
            scores,
            message: "Life Balance scores calculated and saved successfully"
        })

    } catch (error) {
        console.error("Error calculating life balance:", error)
        return NextResponse.json(
            { error: "Failed to calculate life balance scores" },
            { status: 500 }
        )
    }
}
