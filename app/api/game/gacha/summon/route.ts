import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

const SUMMON_COST = 100

// Rarity weights (lower is rarer)
const RARITY_WEIGHTS: Record<string, number> = {
    common: 60,
    uncommon: 25,
    rare: 10,
    epic: 4,
    legendary: 1
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // Check stats
            const stats = await tx.userStats.findUnique({
                where: { userId: user.id }
            })

            if (!stats || stats.crystals < SUMMON_COST) {
                throw new Error('NOT_ENOUGH_CRYSTALS')
            }

            // Deduct cost
            await tx.userStats.update({
                where: { userId: user.id },
                data: { crystals: { decrement: SUMMON_COST } }
            })

            // Fetch all companions
            const companions = await tx.companion.findMany()
            if (companions.length === 0) {
                throw new Error('NO_COMPANIONS_AVAILABLE')
            }

            // Weighted random selection
            const weightedPool = companions.flatMap(c => {
                const weight = RARITY_WEIGHTS[c.rarity.toLowerCase()] || 10
                return Array(weight).fill(c)
            })

            const selectedCompanion = weightedPool[Math.floor(Math.random() * weightedPool.length)]

            // Check if already owned
            const existing = await tx.userCompanion.findUnique({
                where: {
                    userId_companionId: {
                        userId: user.id,
                        companionId: selectedCompanion.id
                    }
                }
            })

            if (existing) {
                // Determine duplicate reward (e.g., XP)
                const xpGain = 100 * (existing.level || 1) // Simple XP calculation
                const updated = await tx.userCompanion.update({
                    where: { id: existing.id },
                    data: { experience: { increment: 500 } } // Flat 500 XP for duplicate
                })
                return {
                    type: 'DUPLICATE',
                    companion: selectedCompanion,
                    userCompanion: updated,
                    reward: { type: 'XP', amount: 500 }
                }
            } else {
                // Create new
                const newCompanion = await tx.userCompanion.create({
                    data: {
                        userId: user.id,
                        companionId: selectedCompanion.id,
                        isActive: false
                    },
                    include: { companion: true }
                })
                return {
                    type: 'NEW',
                    companion: selectedCompanion,
                    userCompanion: newCompanion
                }
            }
        })

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Summon error:', error)
        if (error.message === 'NOT_ENOUGH_CRYSTALS') {
            return NextResponse.json({ error: 'クリスタルが足りません' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to summon' }, { status: 500 })
    }
}
