import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json()

        // Verify ownership
        const existingTask = await prisma.task.findUnique({
            where: { id, userId: user.id },
        })

        if (!existingTask) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...body,
                scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
            },
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error("Tasks API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        // Verify ownership
        const existingTask = await prisma.task.findUnique({
            where: { id, userId: user.id },
        })

        if (!existingTask) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        await prisma.task.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Tasks API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
