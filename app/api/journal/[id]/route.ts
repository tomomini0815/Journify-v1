import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { revalidatePath, revalidateTag } from "next/cache"

export async function GET(
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
        const journal = await prisma.journalEntry.findUnique({
            where: {
                id: id,
                userId: user.id,
            },
        })

        if (!journal) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        return NextResponse.json(journal)
    } catch (error) {
        console.error("GET /api/journal/[id] error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

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
        const existingJournal = await prisma.journalEntry.findUnique({
            where: { id, userId: user.id },
        })

        if (!existingJournal) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        const journal = await prisma.journalEntry.update({
            where: { id },
            data: {
                title: body.title,
                content: body.content,
                mood: body.mood,
                tags: body.tags,
                energy: body.energy,
                stress: body.stress,
                sleep: body.sleep,
                activities: body.activities,
            },
        })

        // Revalidate dashboard cache to show updated journal immediately
        revalidateTag('dashboard', 'max')
        revalidateTag('journal', 'max')
        revalidatePath('/dashboard')

        return NextResponse.json(journal)
    } catch (error) {
        console.error("PATCH /api/journal/[id] error:", error)
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
        const journal = await prisma.journalEntry.findUnique({
            where: {
                id: id,
                userId: user.id,
            },
        })

        if (!journal) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        await prisma.journalEntry.delete({
            where: { id: id },
        })

        // Revalidate dashboard cache to remove deleted journal immediately
        revalidateTag('dashboard', 'max')
        revalidateTag('journal', 'max')
        revalidatePath('/dashboard')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("DELETE /api/journal/[id] error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
