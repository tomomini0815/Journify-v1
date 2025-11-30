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
        const { content, metadata } = body

        // Verify ownership
        const existingItem = await prisma.visionBoardItem.findUnique({
            where: {
                id: id,
                userId: user.id,
            },
        })

        if (!existingItem) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        const updatedItem = await prisma.visionBoardItem.update({
            where: { id: id },
            data: {
                content,
                metadata: metadata || undefined,
            },
        })

        return NextResponse.json(updatedItem)
    } catch (error) {
        console.error("PATCH /api/vision-board/[id] error:", error)
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
        const existingItem = await prisma.visionBoardItem.findUnique({
            where: {
                id: id,
                userId: user.id,
            },
        })

        if (!existingItem) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        await prisma.visionBoardItem.delete({
            where: { id: id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("DELETE /api/vision-board/[id] error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
