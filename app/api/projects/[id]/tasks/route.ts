import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

import { createClient } from "@/lib/supabase/server"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id: projectId } = await params
        const body = await req.json()
        const { text, startDate, endDate, description, priority, status, color } = body

        // Verify project belongs to user
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: user.id }
        })

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            )
        }

        const task = await prisma.task.create({
            data: {
                text,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                description,
                priority,
                status,
                color,
                userId: user.id,
                projectId
            }
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error("Failed to create task:", error)
        return NextResponse.json(
            { error: "Failed to create task", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}
