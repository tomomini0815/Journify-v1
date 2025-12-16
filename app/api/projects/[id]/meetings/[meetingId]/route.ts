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

        const meetingLog = await prisma.meetingLog.update({
            where: {
                id: meetingId,
                projectId: id
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

        await prisma.meetingLog.delete({
            where: {
                id: meetingId,
                projectId: id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete meeting log:", error)
        return NextResponse.json(
            { error: "Failed to delete meeting log" },
            { status: 500 }
        )
    }
}
