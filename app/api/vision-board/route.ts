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
        const items = await prisma.visionBoardItem.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(items)
    } catch (error) {
        console.error("GET /api/vision-board error:", error)
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
        const { type, content, metadata } = body

        const item = await prisma.visionBoardItem.create({
            data: {
                type,
                content,
                metadata: metadata || {},
                userId: user.id,
            },
        })

        return NextResponse.json(item)
    } catch (error) {
        console.error("POST /api/vision-board error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
