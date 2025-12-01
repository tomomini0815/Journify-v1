import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const USER_ID = "42c1eda0-18f2-4213-86b0-55b47ee003f3"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const body = await req.json()
        const { text, startDate, endDate } = body

        // Verify project belongs to user
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: USER_ID }
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
                userId: USER_ID,
                projectId
            }
        })

        return NextResponse.json(task)
    } catch (error: any) {
        console.error("Failed to create task:", error)
        return NextResponse.json(
            { error: "Failed to create task", details: error.message },
            { status: 500 }
        )
    }
}
