import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { endpoint } = await request.json()

        if (!endpoint) {
            return NextResponse.json({ error: "Endpoint required" }, { status: 400 })
        }

        // Delete subscription
        await prisma.pushSubscription.delete({
            where: { endpoint }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("POST /api/push/unsubscribe error:", error)
        // Check if error is "Record to delete does not exist"
        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
            return NextResponse.json({ success: true }) // Align idempotency
        }

        return NextResponse.json(
            { error: "Failed to unsubscribe" },
            { status: 500 }
        )
    }
}
