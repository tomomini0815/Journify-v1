import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PUT /api/workflow-templates/[id] - Update a template
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, description, tasks } = body

        if (!name || !description || !tasks || !Array.isArray(tasks)) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }

        // Verify ownership
        const existing = await prisma.workflowTemplate.findUnique({
            where: { id: params.id }
        })

        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        const template = await prisma.workflowTemplate.update({
            where: { id: params.id },
            data: {
                name,
                description,
                tasks
            }
        })

        return NextResponse.json(template)
    } catch (error) {
        console.error('Failed to update workflow template:', error)
        return NextResponse.json(
            { error: 'Failed to update workflow template' },
            { status: 500 }
        )
    }
}

// DELETE /api/workflow-templates/[id] - Delete a template
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify ownership
        const existing = await prisma.workflowTemplate.findUnique({
            where: { id: params.id }
        })

        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        await prisma.workflowTemplate.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete workflow template:', error)
        return NextResponse.json(
            { error: 'Failed to delete workflow template' },
            { status: 500 }
        )
    }
}
