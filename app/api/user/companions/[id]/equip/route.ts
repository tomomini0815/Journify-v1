import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// PATCH: Equip/unequip an outfit on a companion
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: companionId } = await params
        const { outfitId, category, action } = await request.json()
        // action: 'equip' | 'unequip'
        // category: 'hat' | 'clothes' | 'accessory'

        // Verify ownership of companion
        const userCompanion = await prisma.userCompanion.findFirst({
            where: { id: companionId, userId: user.id }
        })

        if (!userCompanion) {
            return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
        }

        const currentOutfits = (userCompanion.equippedOutfits as Record<string, string>) || {}

        if (action === 'equip') {
            if (!outfitId || !category) {
                return NextResponse.json({ error: 'outfitId and category required' }, { status: 400 })
            }

            // Verify user owns this outfit
            const userOutfit = await prisma.userPetOutfit.findUnique({
                where: {
                    userId_outfitId: { userId: user.id, outfitId }
                },
                include: { outfit: true }
            })

            if (!userOutfit) {
                return NextResponse.json({ error: 'この衣装を持っていません' }, { status: 400 })
            }

            // Equip
            currentOutfits[category] = outfitId
        } else if (action === 'unequip') {
            if (!category) {
                return NextResponse.json({ error: 'category required' }, { status: 400 })
            }
            delete currentOutfits[category]
        }

        const updated = await prisma.userCompanion.update({
            where: { id: companionId },
            data: { equippedOutfits: currentOutfits },
            include: { companion: true }
        })

        return NextResponse.json({
            companion: updated,
            message: action === 'equip' ? '衣装を装備しました！' : '衣装を外しました'
        })
    } catch (error) {
        console.error('PATCH /api/user/companions/:id/equip error:', error)
        return NextResponse.json(
            { error: 'Failed to equip outfit' },
            { status: 500 }
        )
    }
}
