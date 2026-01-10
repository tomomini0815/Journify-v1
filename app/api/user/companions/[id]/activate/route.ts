import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// PATCH: Activate/deactivate companion
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

        // Verify ownership
        const userCompanion = await prisma.userCompanion.findFirst({
            where: {
                id: companionId,
                userId: user.id
            }
        })

        if (!userCompanion) {
            return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
        }

        // Deactivate all other companions
        await prisma.userCompanion.updateMany({
            where: {
                userId: user.id,
                isActive: true
            },
            data: {
                isActive: false
            }
        })

        // Activate this companion
        const updated = await prisma.userCompanion.update({
            where: { id: companionId },
            data: {
                isActive: true
            },
            include: {
                companion: true
            }
        })

        return NextResponse.json({
            companion: updated,
            message: `${updated.companion.name} is now your active companion!`
        })
    } catch (error) {
        console.error('PATCH /api/user/companions/:id/activate error:', error)
        return NextResponse.json(
            { error: 'Failed to activate companion' },
            { status: 500 }
        )
    }
}
