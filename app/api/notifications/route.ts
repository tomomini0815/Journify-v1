import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

// GET: ユーザーの通知を取得
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const unreadOnly = searchParams.get('unread') === 'true'

        const notifications = await prisma.notification.findMany({
            where: {
                userId: user.id,
                ...(unreadOnly ? { isRead: false } : {})
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: user.id,
                isRead: false
            }
        })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error("GET /api/notifications error:", error)
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        )
    }
}

// PATCH: 通知を既読にする
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { notificationId, markAllAsRead } = body

        if (markAllAsRead) {
            // すべて既読にする
            await prisma.notification.updateMany({
                where: {
                    userId: user.id,
                    isRead: false
                },
                data: {
                    isRead: true
                }
            })
        } else if (notificationId) {
            // 特定の通知を既読にする
            await prisma.notification.update({
                where: {
                    id: notificationId,
                    userId: user.id
                },
                data: {
                    isRead: true
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("PATCH /api/notifications error:", error)
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        )
    }
}
