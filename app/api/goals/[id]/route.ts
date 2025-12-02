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
        const { title, description, targetDate, progress, completed, timeframe } = body

        // Verify ownership
        const existingGoal = await prisma.goal.findUnique({
            where: {
                id: id,
                userId: user.id,
            },
        })

        if (!existingGoal) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: id },
            data: {
                title,
                description,
                targetDate: targetDate ? new Date(targetDate) : undefined,
                progress,
                timeframe,
                // If completed is true, set progress to 100, else use provided progress
                // This logic might need adjustment based on requirements, but for now let's trust the input
            },
        })

        return NextResponse.json(updatedGoal)
    } catch (error) {
        console.error("PATCH /api/goals/[id] error:", error)
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
        const existingGoal = await prisma.goal.findUnique({
            where: {
                id: id,
                userId: user.id,
            },
        })

        if (!existingGoal) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        await prisma.goal.delete({
            where: { id: id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("DELETE /api/goals/[id] error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
