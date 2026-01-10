import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET: Fetch user's owned decorations
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userDecorations = await prisma.userDecoration.findMany({
            where: { userId: user.id },
            include: {
                decoration: true
            }
        })

        return NextResponse.json({ decorations: userDecorations })
    } catch (error) {
        console.error('GET /api/user/decorations error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user decorations' },
            { status: 500 }
        )
    }
}
