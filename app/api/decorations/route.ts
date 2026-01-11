import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all available decorations (Shop)
export async function GET() {
    try {
        const decorations = await prisma.homeDecoration.findMany({
            orderBy: [
                { price: 'asc' },
                { name: 'asc' }
            ]
        })

        return NextResponse.json({ decorations })
    } catch (error) {
        console.error('GET /api/decorations error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch decorations' },
            { status: 500 }
        )
    }
}
