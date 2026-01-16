import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

// Generate share link
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

        // Generate unique share token
        const shareToken = randomUUID()

        // Update project with share token
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                shareToken,
                isPublic: true,
                sharedAt: new Date()
            } as any // Type assertion until Prisma client is regenerated
        })

        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://myjournifyapp.com'}/shared/${shareToken}`

        return NextResponse.json({
            shareUrl,
            shareToken,
            project: updatedProject
        })
    } catch (error) {
        console.error("Failed to generate share link:", error)
        return NextResponse.json(
            { error: "Failed to generate share link" },
            { status: 500 }
        )
    }
}

// Remove share link
export async function DELETE(
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

        // Remove share token
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                shareToken: null,
                isPublic: false,
                sharedAt: null
            } as any // Type assertion until Prisma client is regenerated
        })

        return NextResponse.json({
            success: true,
            project: updatedProject
        })
    } catch (error) {
        console.error("Failed to remove share link:", error)
        return NextResponse.json(
            { error: "Failed to remove share link" },
            { status: 500 }
        )
    }
}
