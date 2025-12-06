import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    try {
        const { shareToken } = await params

        const project = await prisma.project.findFirst({
            where: {
                shareToken,
                isPublic: true
            }
        })

        if (!project) {
            return new NextResponse("Project not found", { status: 404 })
        }

        const comments = await prisma.comment.findMany({
            where: {
                projectId: project.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(comments)
    } catch (error) {
        console.error("Failed to fetch comments:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ shareToken: string }> }
) {
    try {
        const { shareToken } = await params
        const { content, authorName } = await req.json()

        if (!content || !authorName) {
            return new NextResponse("Missing content or author name", { status: 400 })
        }

        const project = await prisma.project.findFirst({
            where: {
                shareToken,
                isPublic: true
            }
        })

        if (!project) {
            return new NextResponse("Project not found", { status: 404 })
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                authorName,
                projectId: project.id
            }
        })

        return NextResponse.json(comment)
    } catch (error) {
        console.error("Failed to create comment:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
