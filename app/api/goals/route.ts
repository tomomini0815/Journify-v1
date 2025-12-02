import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const goals = await prisma.goal.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(goals)
    } catch (error) {
        console.error("GET /api/goals error:", error)
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
        const { title, description, targetDate, progress, priority, timeframe } = body

        const goal = await prisma.goal.create({
            data: {
                title,
                description,
                targetDate: targetDate ? new Date(targetDate) : null,
                progress: progress || 0,
                priority: priority || "medium",
                timeframe: timeframe || "short",
                userId: user.id,
            },
        })

        return NextResponse.json(goal)
    } catch (error) {
        console.error("POST /api/goals error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
