import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { DEFAULT_ACHIEVEMENTS, checkAchievementUnlock } from '@/lib/game/achievementSystem'
import { grantAchievementReward } from '@/lib/game/rewardSystem'

export const dynamic = 'force-dynamic'

// GET: ユーザーの称号一覧を取得
export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 全称号を取得
        let achievements = await prisma.achievement.findMany()

        // 称号が存在しない場合、デフォルト称号を作成
        if (achievements.length === 0) {
            for (const achData of DEFAULT_ACHIEVEMENTS) {
                await prisma.achievement.create({
                    data: achData
                })
            }

            achievements = await prisma.achievement.findMany()
        }

        // ユーザーの解放済み称号を取得
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId: user.id },
            include: { achievement: true }
        })

        // ユーザーステータスを取得（解放条件チェック用）
        const stats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        })

        // ジャーナル数などを取得
        const journalCount = await prisma.journalEntry.count({
            where: { userId: user.id }
        })

        const voiceJournalCount = await prisma.voiceJournal.count({
            where: { userId: user.id }
        })

        const goalCount = await prisma.goal.count({
            where: { userId: user.id, completed: true }
        })

        const taskCount = await prisma.task.count({
            where: { userId: user.id, completed: true }
        })

        const projectCount = await prisma.project.count({
            where: { userId: user.id, status: 'completed' }
        })

        const userStats = {
            currentStreak: stats?.currentStreak || 0,
            totalJournals: journalCount,
            totalGoals: goalCount,
            level: stats?.level || 1,
            totalXP: stats?.totalXP || 0,
            totalTasks: taskCount,
            totalProjects: projectCount,
            totalVoiceJournals: voiceJournalCount
        }

        // 自動解放チェック
        for (const achievement of achievements) {
            const isUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id)

            if (!isUnlocked && checkAchievementUnlock(achievement as any, userStats)) {
                // 称号を自動解放
                await prisma.userAchievement.create({
                    data: {
                        userId: user.id,
                        achievementId: achievement.id,
                        unlockedAt: new Date()
                    }
                })

                // 報酬を付与
                if (stats) {
                    const { updatedStats } = grantAchievementReward(stats as any, achievement as any)

                    await prisma.userStats.update({
                        where: { userId: user.id },
                        data: {
                            ...updatedStats,
                            updatedAt: new Date()
                        }
                    })
                }
            }
        }

        // 再取得
        const updatedUserAchievements = await prisma.userAchievement.findMany({
            where: { userId: user.id },
            include: { achievement: true }
        })

        // 全称号に解放状態を付与
        const achievementsWithStatus = achievements.map(ach => {
            const userAch = updatedUserAchievements.find(ua => ua.achievementId === ach.id)
            return {
                ...ach,
                isUnlocked: !!userAch,
                isEquipped: userAch?.isEquipped || false,
                unlockedAt: userAch?.unlockedAt
            }
        })

        return NextResponse.json({
            achievements: achievementsWithStatus,
            userStats
        })
    } catch (error) {
        console.error('Get achievements error:', error)
        return NextResponse.json(
            { error: 'Failed to get achievements' },
            { status: 500 }
        )
    }
}

// POST: 称号を装備/解除
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { achievementId } = body

        // 既に装備している称号を全て解除
        await prisma.userAchievement.updateMany({
            where: {
                userId: user.id,
                isEquipped: true
            },
            data: { isEquipped: false }
        })

        // 指定された称号を装備
        const updated = await prisma.userAchievement.updateMany({
            where: {
                userId: user.id,
                achievementId
            },
            data: { isEquipped: true }
        })

        return NextResponse.json({
            message: 'Achievement equipped successfully',
            updated
        })
    } catch (error) {
        console.error('Equip achievement error:', error)
        return NextResponse.json(
            { error: 'Failed to equip achievement' },
            { status: 500 }
        )
    }
}
