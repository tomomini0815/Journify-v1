import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

import { createClient } from "@/lib/supabase/server"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: projectId } = await params
        const body = await req.json()
        const { title, date } = body

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

        const milestone = await prisma.milestone.create({
            data: {
                title,
                date: new Date(date),
                projectId
            }
        })

        return NextResponse.json(milestone)
    } catch (error) {
        console.error("Failed to create milestone:", error)
        return NextResponse.json(
            { error: "Failed to create milestone", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        )
    }
}
