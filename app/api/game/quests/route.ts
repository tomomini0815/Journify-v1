import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { DEFAULT_DAILY_QUESTS, DEFAULT_WEEKLY_QUESTS, checkQuestProgress, shouldResetDailyQuest, shouldResetWeeklyQuest } from '@/lib/game/questSystem'
import { grantQuestReward } from '@/lib/game/rewardSystem'

export const dynamic = 'force-dynamic'

// GET: ユーザーのクエスト一覧を取得
export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ユーザーステータスを取得
        const stats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        })

        if (!stats) {
            return NextResponse.json({ error: 'Stats not found' }, { status: 404 })
        }

        // 全クエストを取得
        const quests = await prisma.quest.findMany({
            where: {
                isActive: true,
                minLevel: { lte: stats.level }
            }
        })

        // クエストが存在しない場合、デフォルトクエストを作成
        if (quests.length === 0) {
            const defaultQuests = [...DEFAULT_DAILY_QUESTS, ...DEFAULT_WEEKLY_QUESTS]

            for (const questData of defaultQuests) {
                await prisma.quest.create({
                    data: {
                        ...questData,
                        updatedAt: new Date()
                    } as any
                })
            }

            // 再取得
            const newQuests = await prisma.quest.findMany({
                where: {
                    isActive: true,
                    minLevel: { lte: stats.level }
                }
            })

            // ユーザークエストを初期化
            for (const quest of newQuests) {
                await prisma.userQuest.create({
                    data: {
                        userId: user.id,
                        questId: quest.id,
                        progress: 0,
                        isCompleted: false,
                        lastResetAt: new Date()
                    }
                })
            }
        }

        // ユーザークエスト進捗を取得
        let userQuests = await prisma.userQuest.findMany({
            where: { userId: user.id },
            include: { quest: true }
        })

        // デイリー/ウィークリーのリセットチェック
        for (const userQuest of userQuests) {
            let needsReset = false

            if (userQuest.quest.type === 'daily') {
                needsReset = shouldResetDailyQuest(userQuest.lastResetAt)
            } else if (userQuest.quest.type === 'weekly') {
                needsReset = shouldResetWeeklyQuest(userQuest.lastResetAt)
            }

            if (needsReset) {
                await prisma.userQuest.update({
                    where: { id: userQuest.id },
                    data: {
                        progress: 0,
                        isCompleted: false,
                        completedAt: null,
                        lastResetAt: new Date()
                    }
                })
            }
        }

        // 再取得
        userQuests = await prisma.userQuest.findMany({
            where: { userId: user.id },
            include: { quest: true }
        })

        // デイリーとウィークリーに分類
        const dailyQuests = userQuests.filter(uq => uq.quest.type === 'daily')
        const weeklyQuests = userQuests.filter(uq => uq.quest.type === 'weekly')

        return NextResponse.json({
            daily: dailyQuests,
            weekly: weeklyQuests
        })
    } catch (error) {
        console.error('Get quests error:', error)
        return NextResponse.json(
            { error: 'Failed to get quests' },
            { status: 500 }
        )
    }
}

// POST: クエスト完了または報酬受け取り
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { questId, action } = body // action: 'complete' or 'claim'

        const userQuest = await prisma.userQuest.findFirst({
            where: {
                userId: user.id,
                questId
            },
            include: { quest: true }
        })

        if (!userQuest) {
            return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
        }

        if (action === 'complete') {
            // クエストを完了状態にする
            const updated = await prisma.userQuest.update({
                where: { id: userQuest.id },
                data: {
                    isCompleted: true,
                    completedAt: new Date()
                }
            })

            return NextResponse.json({ userQuest: updated })
        }

        if (action === 'claim') {
            // 報酬を付与
            const stats = await prisma.userStats.findUnique({
                where: { userId: user.id }
            })

            if (!stats) {
                return NextResponse.json({ error: 'Stats not found' }, { status: 404 })
            }

            const { updatedStats, result } = grantQuestReward(stats as any, userQuest.quest)

            // ステータスを更新
            await prisma.userStats.update({
                where: { userId: user.id },
                data: {
                    ...updatedStats,
                    updatedAt: new Date()
                }
            })

            // クエストを削除（報酬受け取り後）
            await prisma.userQuest.delete({
                where: { id: userQuest.id }
            })

            return NextResponse.json({
                result,
                message: 'Reward claimed successfully'
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Quest action error:', error)
        return NextResponse.json(
            { error: 'Failed to process quest action' },
            { status: 500 }
        )
    }
}
