import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { grantXP } from '@/lib/game/rewardSystem'

export const dynamic = 'force-dynamic'

// GET: ユーザーのゲームステータスを取得
export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ユーザーステータスを取得（存在しない場合は作成）
        let stats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        })

        if (!stats) {
            // 初回アクセス時にステータスを作成
            stats = await prisma.userStats.create({
                data: {
                    userId: user.id,
                    level: 1,
                    totalXP: 0,
                    xp: 0,
                    strength: 50,
                    vitality: 50,
                    intelligence: 50,
                    charisma: 50,
                    luck: 50,
                    spirit: 50,
                    gold: 0,
                    crystals: 0,
                    fame: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    totalJournals: 0,
                    totalTasks: 0,
                    totalMeetings: 0,
                    totalGoals: 0
                }
            })
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Get game stats error:', error)
        return NextResponse.json(
            { error: 'Failed to get game stats' },
            { status: 500 }
        )
    }
}

// POST: XPを付与してステータスを更新
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { xp, gold, crystals, statChanges } = body

        // 現在のステータスを取得
        const currentStats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        })

        if (!currentStats) {
            return NextResponse.json({ error: 'Stats not found' }, { status: 404 })
        }

        // XPを付与
        const { updatedStats, result } = grantXP(currentStats as any, xp || 0)

        // ステータスを更新
        const updates: any = { ...updatedStats }

        if (gold) {
            updates.gold = (currentStats.gold || 0) + gold
        }

        if (crystals) {
            updates.crystals = (currentStats.crystals || 0) + crystals
        }

        if (statChanges) {
            Object.entries(statChanges).forEach(([key, value]) => {
                if (key in currentStats) {
                    updates[key] = Math.min(100, Math.max(0, (currentStats[key as keyof typeof currentStats] as number || 0) + (value as number)))
                }
            })
        }

        updates.lastXPUpdate = new Date()
        updates.updatedAt = new Date()

        const newStats = await prisma.userStats.update({
            where: { userId: user.id },
            data: updates
        })

        return NextResponse.json({
            stats: newStats,
            result
        })
    } catch (error) {
        console.error('Update game stats error:', error)
        return NextResponse.json(
            { error: 'Failed to update game stats' },
            { status: 500 }
        )
    }
}
