import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all available pet outfits
export async function GET() {
    try {
        const outfits = await prisma.petOutfit.findMany({
            orderBy: [
                { category: 'asc' },
                { price: 'asc' },
                { name: 'asc' }
            ]
        })

        return NextResponse.json({ outfits })
    } catch (error) {
        console.error('GET /api/pet-outfits error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch outfits' },
            { status: 500 }
        )
    }
}
