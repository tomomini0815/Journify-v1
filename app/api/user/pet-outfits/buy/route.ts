import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// POST: Buy a pet outfit
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { outfitId } = await request.json()

        if (!outfitId) {
            return NextResponse.json({ error: 'Outfit ID required' }, { status: 400 })
        }

        // Fetch the outfit
        const outfit = await prisma.petOutfit.findUnique({
            where: { id: outfitId }
        })

        if (!outfit) {
            return NextResponse.json({ error: 'Outfit not found' }, { status: 404 })
        }

        // Check if user already owns this outfit
        const existing = await prisma.userPetOutfit.findUnique({
            where: {
                userId_outfitId: {
                    userId: user.id,
                    outfitId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ error: 'この衣装はすでに持っています' }, { status: 400 })
        }

        // Check user's gold
        const stats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        })

        if (!stats || stats.gold < outfit.price) {
            return NextResponse.json({ error: 'ゴールドが足りません' }, { status: 400 })
        }

        // Check user's companion level (use highest level companion)
        const highestCompanion = await prisma.userCompanion.findFirst({
            where: { userId: user.id },
            orderBy: { level: 'desc' }
        })

        if (!highestCompanion || highestCompanion.level < outfit.unlockLevel) {
            return NextResponse.json({
                error: `この衣装にはペットレベル ${outfit.unlockLevel} が必要です`
            }, { status: 400 })
        }

        // Transaction: deduct gold and create ownership
        const [updatedStats, userOutfit] = await prisma.$transaction([
            prisma.userStats.update({
                where: { userId: user.id },
                data: { gold: stats.gold - outfit.price }
            }),
            prisma.userPetOutfit.create({
                data: {
                    userId: user.id,
                    outfitId
                },
                include: { outfit: true }
            })
        ])

        return NextResponse.json({
            success: true,
            outfit: userOutfit,
            remainingGold: updatedStats.gold,
            message: `「${outfit.name}」を購入しました！`
        })
    } catch (error) {
        console.error('POST /api/user/pet-outfits/buy error:', error)
        return NextResponse.json(
            { error: 'Failed to buy outfit' },
            { status: 500 }
        )
    }
}
