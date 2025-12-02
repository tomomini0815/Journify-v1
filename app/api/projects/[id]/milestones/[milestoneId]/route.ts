import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const USER_ID = "42c1eda0-18f2-4213-86b0-55b47ee003f3"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
    try {
        const { id: projectId, milestoneId } = await params
        const body = await req.json()
        const { title, date, completed } = body

        // Verify milestone belongs to project (and thus user via project)
        const milestone = await prisma.milestone.findFirst({
            where: {
                id: milestoneId,
                projectId,
                project: { userId: USER_ID }
            }
        })

        if (!milestone) {
            return NextResponse.json(
                { error: "Milestone not found" },
                { status: 404 }
            )
        }

        const updatedMilestone = await prisma.milestone.update({
            where: { id: milestoneId },
            data: {
                title,
                date: date ? new Date(date) : undefined,
                completed
            }
        })

        return NextResponse.json(updatedMilestone)
    } catch (error: any) {
        console.error("Failed to update milestone:", error)
        return NextResponse.json(
            { error: "Failed to update milestone", details: error.message },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
    try {
        const { id: projectId, milestoneId } = await params

        // Verify milestone belongs to project
        const milestone = await prisma.milestone.findFirst({
            where: {
                id: milestoneId,
                projectId,
                project: { userId: USER_ID }
            }
        })

        if (!milestone) {
            return NextResponse.json(
                { error: "Milestone not found" },
                { status: 404 }
            )
        }

        await prisma.milestone.delete({
            where: { id: milestoneId }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Failed to delete milestone:", error)
        return NextResponse.json(
            { error: "Failed to delete milestone", details: error.message },
            { status: 500 }
        )
    }
}
