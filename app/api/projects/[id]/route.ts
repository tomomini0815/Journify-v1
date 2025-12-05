import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const project = await prisma.project.findUnique({
            where: {
                id,
                userId: user.id
            },
            include: {
                milestones: {
                    orderBy: { date: 'asc' }
                },
                tasks: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error("Failed to fetch project:", error)
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()
        const { title, description, status, startDate, endDate } = body

        const project = await prisma.project.update({
            where: {
                id,
                userId: user.id
            },
            data: {
                title,
                description,
                status,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error("Failed to update project:", error)
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        await prisma.project.delete({
            where: {
                id,
                userId: user.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete project:", error)
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        )
    }
}
