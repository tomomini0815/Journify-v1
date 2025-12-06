import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/workflow-templates - Get all custom templates for the current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const templates = await prisma.workflowTemplate.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(templates)
    } catch (error) {
        console.error('Failed to fetch workflow templates:', error)
        return NextResponse.json(
            { error: 'Failed to fetch workflow templates' },
            { status: 500 }
        )
    }
}

// POST /api/workflow-templates - Create a new custom template
export async function POST(request: NextRequest) {
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

        const template = await prisma.workflowTemplate.create({
            data: {
                userId: session.user.id,
                name,
                description,
                tasks
            }
        })

        return NextResponse.json(template, { status: 201 })
    } catch (error) {
        console.error('Failed to create workflow template:', error)
        return NextResponse.json(
            { error: 'Failed to create workflow template' },
            { status: 500 }
        )
    }
}
