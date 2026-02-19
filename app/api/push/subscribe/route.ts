
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

        // Debug: Check available models
        console.log("Prisma keys:", Object.keys(prisma));

        const subscription = await request.json()
        console.log("Received subscription payload:", JSON.stringify(subscription, null, 2));

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            console.error("Invalid subscription payload:", subscription);
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Save subscription
        await prisma.pushSubscription.upsert({
            where: {
                endpoint: subscription.endpoint,
            },
            update: {
                userId: user.id,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            create: {
                userId: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("POST /api/push/subscribe error details:", error)
        return NextResponse.json(
            // Return more details for debugging (dev only)
            { error: "Failed to subscribe", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
