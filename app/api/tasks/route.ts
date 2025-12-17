import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                projectId: null  // Only show daily tasks, not project tasks
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(tasks)
    } catch (error) {
        console.error("Tasks API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { text, scheduledDate, status, description, startDate, endDate } = body

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 })
        }

        const task = await prisma.task.create({
            data: {
                text,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : (startDate ? new Date(startDate) : null),
                startDate: startDate ? new Date(startDate) : (scheduledDate ? new Date(scheduledDate) : null),
                endDate: endDate ? new Date(endDate) : null,
                status: status || 'todo',
                userId: user.id,
                description: description || null,
            },
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error("Tasks API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
