import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// POST: Play with companion
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const companionId = params.id

        // Fetch user companion
        const userCompanion = await prisma.userCompanion.findFirst({
            where: {
                id: companionId,
                userId: user.id
            }
        })

        if (!userCompanion) {
            return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
        }

        // Check if companion has enough energy
        if (userCompanion.energy < 10) {
            return NextResponse.json(
                { error: 'Companion is too tired to play. Feed them first!' },
                { status: 400 }
            )
        }

        // Calculate rewards
        const loyaltyGain = 5
        const expGain = 10
        const energyCost = 10

        // Update companion stats
        const updated = await prisma.userCompanion.update({
            where: { id: companionId },
            data: {
                loyalty: Math.min(100, userCompanion.loyalty + loyaltyGain),
                experience: userCompanion.experience + expGain,
                energy: Math.max(0, userCompanion.energy - energyCost),
                lastPlayedAt: new Date()
            },
            include: {
                companion: true
            }
        })

        // Check for level up
        const expNeeded = updated.level * 100
        let leveledUp = false
        if (updated.experience >= expNeeded) {
            await prisma.userCompanion.update({
                where: { id: companionId },
                data: {
                    level: updated.level + 1,
                    experience: updated.experience - expNeeded
                }
            })
            leveledUp = true
        }

        return NextResponse.json({
            companion: updated,
            rewardXp: expGain,
            leveledUp,
            message: leveledUp
                ? `${updated.companion.name} leveled up to ${updated.level + 1}!`
                : `Played with ${updated.companion.name}!`
        })
    } catch (error) {
        console.error('POST /api/user/companions/:id/play error:', error)
        return NextResponse.json(
            { error: 'Failed to play with companion' },
            { status: 500 }
        )
    }
}
