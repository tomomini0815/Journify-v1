import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; meetingId: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id, meetingId } = await params
        const body = await req.json()
        const { title, date, content, audioUrl, transcript } = body

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id, userId: user.id }
        })

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            )
        }

        // Verify meeting log ownership
        const existingLog = await prisma.meetingLog.findFirst({
            where: {
                id: meetingId,
                projectId: id
            }
        })

        if (!existingLog) {
            return NextResponse.json(
                { error: "Meeting log not found" },
                { status: 404 }
            )
        }

        const meetingLog = await prisma.meetingLog.update({
            where: {
                id: meetingId
            },
            data: {
                title,
                date: date ? new Date(date) : undefined,
                content,
                audioUrl,
                transcript
            }
        })

        return NextResponse.json(meetingLog)
    } catch (error) {
        console.error("Failed to update meeting log:", error)
        return NextResponse.json(
            { error: "Failed to update meeting log" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; meetingId: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id, meetingId } = await params

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id, userId: user.id }
        })

        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            )
        }

        // Use deleteMany to ensure we only delete if it matches both ID and ProjectID
        const { count } = await prisma.meetingLog.deleteMany({
            where: {
                id: meetingId,
                projectId: id
            }
        })

        if (count === 0) {
            return NextResponse.json(
                { error: "Meeting log not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete meeting log:", error)
        return NextResponse.json(
            { error: "Failed to delete meeting log" },
            { status: 500 }
        )
    }
}
