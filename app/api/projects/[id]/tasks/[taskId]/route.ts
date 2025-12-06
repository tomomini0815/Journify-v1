import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    console.log("PATCH /api/projects/[id]/tasks/[taskId] called")
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("Auth error:", authError)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id: projectId, taskId } = await params
        console.log("Params:", { projectId, taskId, userId: user.id })

        const body = await req.json()
        console.log("Body:", body)

        const { text, startDate, endDate, completed, description, url, priority, status, color } = body

        // Verify task belongs to user and project
        const task = await prisma.task.findFirst({
            where: { id: taskId, projectId, userId: user.id }
        })

        if (!task) {
            console.error("Task not found or access denied")
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            )
        }

        console.log("Updating task:", taskId)
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                text,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                completed,
                description,
                url,
                priority,
                status,
                color
            } as any // Type assertion to handle url field until Prisma client is regenerated
        })
        console.log("Task updated successfully")

        return NextResponse.json(updatedTask)
    } catch (error) {
        console.error("Failed to update task:", error)
        return NextResponse.json(
            { error: "Failed to update task", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
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

        const { id: projectId, taskId } = await params

        // Verify task belongs to user and project
        const task = await prisma.task.findFirst({
            where: { id: taskId, projectId, userId: user.id }
        })

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            )
        }

        await prisma.task.delete({
            where: { id: taskId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete task:", error)
        return NextResponse.json(
            { error: "Failed to delete task", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}
