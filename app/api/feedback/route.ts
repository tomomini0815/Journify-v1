
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { type, content, category, affectedPage } = body

        if (!type || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const feedback = await prisma.feedback.create({
            data: {
                userId: user.id,
                type,
                content,
                category,
                affectedPage,
                status: "open",
            },
        })

        return NextResponse.json(feedback)
    } catch (error) {
        console.error("Feedback API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
