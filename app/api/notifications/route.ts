import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import webpush from "web-push"

// Initialize web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@journify.app',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

// GET: ユーザーの通知を取得
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // --- 自動通知生成ロジック ---
        // 15分以内に予定されているタスクを検索
        const now = new Date()
        const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000)

        // 期限が15分以内の未完了タスクを取得
        const upcomingTasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                completed: false,
                scheduledDate: {
                    gte: now,
                    lte: fifteenMinutesLater
                }
            }
        })

        // 各タスクについて、すでに通知が存在するか確認し、なければ作成
        for (const task of upcomingTasks) {
            // このタスクに対する「task_reminder」通知がすでに存在するかチェック
            const existingNotification = await prisma.notification.findFirst({
                where: {
                    userId: user.id,
                    type: "task_reminder",
                    actionUrl: `/tasks?highlight=${task.id}`
                }
            })

            if (!existingNotification) {
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: "task_reminder",
                        title: "タスクの期限が迫っています",
                        message: `「${task.text}」が15分以内に予定されています。`,
                        actionUrl: `/tasks?highlight=${task.id}`,
                        isRead: false
                    }
                })

                // --- Web Push送信 ---
                try {
                    const subscriptions = await prisma.pushSubscription.findMany({
                        where: { userId: user.id }
                    })

                    const payload = JSON.stringify({
                        title: "タスクの期限が迫っています",
                        body: `「${task.text}」が15分以内に予定されています。`,
                        icon: '/icons/icon-192x192.png',
                        url: `/tasks?highlight=${task.id}`
                    })

                    await Promise.allSettled(
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
                } catch (pushError) {
                    console.error("Failed to send web push:", pushError)
                }
                // -------------------
            }
        }
        // ---------------------------

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
