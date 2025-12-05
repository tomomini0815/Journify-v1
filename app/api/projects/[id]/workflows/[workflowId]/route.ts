import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string, workflowId: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id: projectId, workflowId } = await params

        // Verify project belongs to user
        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
                userId: user.id
            }
        })

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            )
        }

        // Delete all tasks with this workflowId in this project
        await prisma.task.deleteMany({
            where: {
                projectId,
                workflowId
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete workflow tasks:", error)
        return NextResponse.json(
            { error: "Failed to delete workflow tasks" },
            { status: 500 }
        )
    }
}
