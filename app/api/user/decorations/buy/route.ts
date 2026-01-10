import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// POST: Buy decoration
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { decorationId } = await request.json()

        // 1. Check decoration exists and get price
        const decoration = await prisma.homeDecoration.findUnique({
            where: { id: decorationId }
        })

        if (!decoration) {
            return NextResponse.json({ error: 'Decoration not found' }, { status: 404 })
        }

        // TODO: Check user currency (Garden Coins) - Skipping for now, assuming free/infinite
        // const userStats = ...
        // if (userStats.coins < decoration.price) ...

        // 2. Add to user inventory
        // Check if already owns
        const existing = await prisma.userDecoration.findUnique({
            where: {
                userId_decorationId: {
                    userId: user.id,
                    decorationId
                }
            }
        })

        let result
        if (existing) {
            // Increase quantity
            result = await prisma.userDecoration.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + 1 },
                include: { decoration: true }
            })
        } else {
            // Create new
            result = await prisma.userDecoration.create({
                data: {
                    userId: user.id,
                    decorationId
                },
                include: { decoration: true }
            })
        }

        return NextResponse.json({
            success: true,
            purchase: result,
            message: `Purchased ${decoration.name}!`
        })

    } catch (error) {
        console.error('POST /api/user/decorations/buy error:', error)
        return NextResponse.json(
            { error: 'Failed to buy decoration' },
            { status: 500 }
        )
    }
}
