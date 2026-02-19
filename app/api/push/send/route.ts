
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import webpush from "web-push"

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@journify.app';

// Initialize web-push
if (!publicVapidKey || !privateVapidKey) {
    console.warn("VAPID keys are missing!")
} else {
    webpush.setVapidDetails(
        vapidSubject,
        publicVapidKey,
        privateVapidKey
    )
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Admin check or just authorized user for testing
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { title, message, url } = body

        // Fetch user's subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: user.id }
        })

        const payload = JSON.stringify({
            title: title || 'Test Notification',
            body: message || 'This is a test notification from Journify.',
            icon: '/icons/icon-192x192.png',
            url: url || '/dashboard'
        })

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                }, payload)
            )
        )

        // Clean up failed subscriptions (410 Gone)
        const failed = results.filter(r => r.status === 'rejected')
        // In a real app, we should delete subscriptions that returned 410 or 404

        return NextResponse.json({
            success: true,
            sent: results.length - failed.length,
            failed: failed.length
        })
    } catch (error) {
        console.error("POST /api/push/send error:", error)
        return NextResponse.json(
            { error: "Failed to send push" },
            { status: 500 }
        )
    }
}
