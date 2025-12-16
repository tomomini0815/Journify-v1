import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
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

        const meetingLog = await prisma.meetingLog.create({
            data: {
                title,
                date: new Date(date),
                content,
                audioUrl,
                transcript,
                projectId: id
            }
        })

        return NextResponse.json(meetingLog)
    } catch (error) {
        console.error("Failed to create meeting log:", error)
        return NextResponse.json(
            { error: "Failed to create meeting log" },
            { status: 500 }
        )
    }
}
