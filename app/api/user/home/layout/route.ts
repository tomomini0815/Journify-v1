import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// GET: Fetch user's home layout
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const homeLayout = await prisma.userHomeLayout.findUnique({
            where: { userId: user.id }
        })

        if (!homeLayout) {
            // Return default empty layout if none exists
            return NextResponse.json({
                layout: {
                    theme: 'space',
                    items: []
                }
            })
        }

        return NextResponse.json({ layout: homeLayout })
    } catch (error) {
        console.error('GET /api/user/home/layout error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch home layout' },
            { status: 500 }
        )
    }
}

// POST: Save user's home layout
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { items, theme } = await request.json()

        const homeLayout = await prisma.userHomeLayout.upsert({
            where: { userId: user.id },
            update: {
                layout: { items }, // JSON data
                theme: theme || 'space'
            },
            create: {
                userId: user.id,
                layout: { items },
                theme: theme || 'space'
            }
        })

        return NextResponse.json({ success: true, layout: homeLayout })
    } catch (error) {
        console.error('POST /api/user/home/layout error:', error)
        return NextResponse.json(
            { error: 'Failed to save home layout' },
            { status: 500 }
        )
    }
}
