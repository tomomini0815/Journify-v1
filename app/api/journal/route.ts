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
        const journals = await prisma.journalEntry.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(journals)
    } catch (error) {
        console.error("GET /api/journal error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        console.log("Auth check:", { user: user?.id, authError })

        if (!user) {
            console.error("No user found, authError:", authError)
            return NextResponse.json({ error: "Unauthorized", details: authError }, { status: 401 })
        }

        const body = await request.json()
        const { title, content, tags, mood, energy, stress, sleep, activities } = body

        console.log("Creating journal with data:", { title, content, mood, energy, stress, sleep, activities, tags, userId: user.id })

        const journal = await prisma.journalEntry.create({
            data: {
                title,
                content,
                tags: tags || [],
                mood,
                energy,
                stress,
                sleep,
                activities,
                userId: user.id,
            },
        })

        return NextResponse.json(journal)
    } catch (error) {
        console.error("POST /api/journal error:", error)
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
