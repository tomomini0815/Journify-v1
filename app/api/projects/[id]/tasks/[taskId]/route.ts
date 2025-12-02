import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const USER_ID = "42c1eda0-18f2-4213-86b0-55b47ee003f3"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { id: projectId, taskId } = await params
        const body = await req.json()
        const { text, startDate, endDate, completed } = body

        // Verify task belongs to user and project
        const task = await prisma.task.findFirst({
            where: { id: taskId, projectId, userId: USER_ID }
        })

        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            )
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                text,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                completed
            }
        })

        return NextResponse.json(updatedTask)
    } catch (error: any) {
        console.error("Failed to update task:", error)
        return NextResponse.json(
            { error: "Failed to update task", details: error.message },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    try {
        const { id: projectId, taskId } = await params

        // Verify task belongs to user and project
        const task = await prisma.task.findFirst({
            where: { id: taskId, projectId, userId: USER_ID }
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
    } catch (error: any) {
        console.error("Failed to delete task:", error)
        return NextResponse.json(
            { error: "Failed to delete task", details: error.message },
            { status: 500 }
        )
    }
}
