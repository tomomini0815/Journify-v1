import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET: Fetch user's owned pet outfits
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userOutfits = await prisma.userPetOutfit.findMany({
            where: { userId: user.id },
            include: { outfit: true },
            orderBy: { acquiredAt: 'desc' }
        })

        return NextResponse.json({ outfits: userOutfits })
    } catch (error) {
        console.error('GET /api/user/pet-outfits error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user outfits' },
            { status: 500 }
        )
    }
}
