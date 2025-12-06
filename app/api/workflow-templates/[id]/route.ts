import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

// PUT /api/workflow-templates/[id] - Update a template
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
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
            where: { id }
        })

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        const template = await prisma.workflowTemplate.update({
            where: { id },
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const existing = await prisma.workflowTemplate.findUnique({
            where: { id }
        })

        if (!existing || existing.userId !== user.id) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        await prisma.workflowTemplate.delete({
            where: { id }
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
