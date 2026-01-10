import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// POST: Feed companion
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

        const { foodType } = await request.json()
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

        // Calculate stat changes based on food type
        const foodEffects = {
            treat: { happiness: 5, energy: 3 },
            meal: { happiness: 10, energy: 10 },
            deluxe: { happiness: 20, energy: 20 }
        }

        const effect = foodEffects[foodType as keyof typeof foodEffects] || foodEffects.treat

        // Update companion stats
        const updated = await prisma.userCompanion.update({
            where: { id: companionId },
            data: {
                happiness: Math.min(100, userCompanion.happiness + effect.happiness),
                energy: Math.min(100, userCompanion.energy + effect.energy),
                lastFedAt: new Date()
            },
            include: {
                companion: true
            }
        })

        return NextResponse.json({
            companion: updated,
            message: `Fed ${updated.companion.name} with ${foodType}!`
        })
    } catch (error) {
        console.error('POST /api/user/companions/:id/feed error:', error)
        return NextResponse.json(
            { error: 'Failed to feed companion' },
            { status: 500 }
        )
    }
}
