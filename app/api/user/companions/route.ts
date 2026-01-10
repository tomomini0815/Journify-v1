import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET: Fetch user's owned companions
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userCompanions = await prisma.userCompanion.findMany({
            where: { userId: user.id },
            include: {
                companion: true
            },
            orderBy: [
                { isActive: 'desc' },
                { level: 'desc' },
                { acquiredAt: 'desc' }
            ]
        })

        const activeCompanion = userCompanions.find(uc => uc.isActive) || null

        return NextResponse.json({
            companions: userCompanions,
            activeCompanion
        })
    } catch (error) {
        console.error('GET /api/user/companions error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user companions' },
            { status: 500 }
        )
    }
}

// POST: Summon a new companion (from gacha)
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { companionId } = await request.json()

        if (!companionId) {
            return NextResponse.json({ error: 'Companion ID required' }, { status: 400 })
        }

        // Check if user already owns this companion
        const existing = await prisma.userCompanion.findUnique({
            where: {
                userId_companionId: {
                    userId: user.id,
                    companionId
                }
            }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'You already own this companion' },
                { status: 400 }
            )
        }

        // Create new user companion
        const userCompanion = await prisma.userCompanion.create({
            data: {
                userId: user.id,
                companionId,
                isActive: false // User can activate it later
            },
            include: {
                companion: true
            }
        })

        return NextResponse.json({ companion: userCompanion })
    } catch (error) {
        console.error('POST /api/user/companions error:', error)
        return NextResponse.json(
            { error: 'Failed to summon companion' },
            { status: 500 }
        )
    }
}
