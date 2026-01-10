import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET: Fetch all available companions
export async function GET() {
    try {
        const companions = await prisma.companion.findMany({
            orderBy: [
                { rarity: 'asc' },
                { name: 'asc' }
            ]
        })

        return NextResponse.json({ companions })
    } catch (error) {
        console.error('GET /api/companions error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch companions' },
            { status: 500 }
        )
    }
}
