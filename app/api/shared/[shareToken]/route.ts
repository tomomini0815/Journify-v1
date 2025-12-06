import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Get shared project (no authentication required)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    try {
        const { shareToken } = await params

        // Find project by share token
        const project = await prisma.project.findFirst({
            where: {
                shareToken,
                isPublic: true
            } as any, // Type assertion until Prisma client is regenerated
            include: {
                milestones: {
                    orderBy: { date: 'asc' }
                },
                tasks: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!project) {
            return NextResponse.json(
                { error: "Shared project not found or no longer available" },
                { status: 404 }
            )
        }

        // Return project data without user information
        const { userId, ...projectData } = project

        return NextResponse.json({
            ...projectData,
            isShared: true,
            readOnly: true
        })
    } catch (error) {
        console.error("Failed to fetch shared project:", error)
        return NextResponse.json(
            { error: "Failed to fetch shared project" },
            { status: 500 }
        )
    }
}
