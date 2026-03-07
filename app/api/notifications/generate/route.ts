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

// ユーザーの全PushSubscriptionにWeb Pushを送信するヘルパー
async function sendPushToUser(userId: string, notification: { title: string; message: string; url?: string }) {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        })

        if (subscriptions.length === 0) return

        const payload = JSON.stringify({
            title: notification.title,
            body: notification.message,
            icon: '/icons/icon-192x192.png',
            url: notification.url || '/dashboard'
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

        // 失効したサブスクリプション（410 Gone）を削除
        for (let i = 0; i < results.length; i++) {
            const result = results[i]
            if (result.status === 'rejected') {
                const statusCode = (result.reason as any)?.statusCode
                if (statusCode === 410 || statusCode === 404) {
                    try {
                        await prisma.pushSubscription.delete({
                            where: { endpoint: subscriptions[i].endpoint }
                        })
                        console.log(`Deleted expired push subscription: ${subscriptions[i].endpoint}`)
                    } catch (deleteError) {
                        // Already deleted, ignore
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Failed to send push to user ${userId}:`, error)
    }
}

// 通知生成API - CRON jobまたは手動で実行
export async function POST(request: Request) {
    try {
        // セキュリティ: CRON_SECRET を確認（本番環境では必須）
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const now = new Date()
        const threeDaysFromNow = new Date(now)
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

        let createdCount = 0

        // すべてのユーザーを取得
        const users = await prisma.user.findMany({
            select: { id: true }
        })

        for (const user of users) {
            // 期日が近い目標をチェック（3日以内）
            const upcomingGoals = await prisma.goal.findMany({
                where: {
                    userId: user.id,
                    progress: { lt: 100 },
                    targetDate: {
                        gte: now,
                        lte: threeDaysFromNow
                    }
                }
            })

            for (const goal of upcomingGoals) {
                // 既存の通知がないかチェック
                const existingNotification = await prisma.notification.findFirst({
                    where: {
                        userId: user.id,
                        type: 'goal_reminder',
                        actionUrl: `/goals?id=${goal.id}`,
                        createdAt: {
                            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 過去24時間
                        }
                    }
                })

                if (!existingNotification && goal.targetDate) {
                    const daysUntil = Math.ceil((goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    await prisma.notification.create({
                        data: {
                            userId: user.id,
                            type: 'goal_reminder',
                            title: '目標の期日が近づいています',
                            message: `「${goal.title}」の期日まであと ${daysUntil} 日です。`,
                            actionUrl: `/goals?id=${goal.id}`
                        }
                    })
                    // Web Push送信
                    await sendPushToUser(user.id, {
                        title: '目標の期日が近づいています',
                        message: `「${goal.title}」の期日まであと ${daysUntil} 日です。`,
                        url: `/goals?id=${goal.id}`
                    })
                    createdCount++
                }
            }

            // 期限切れの目標をチェック
            const overdueGoals = await prisma.goal.findMany({
                where: {
                    userId: user.id,
                    progress: { lt: 100 },
                    targetDate: {
                        lt: now
                    }
                }
            })

            for (const goal of overdueGoals) {
                const existingNotification = await prisma.notification.findFirst({
                    where: {
                        userId: user.id,
                        type: 'goal_overdue',
                        actionUrl: `/goals?id=${goal.id}`,
                        createdAt: {
                            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
                        }
                    }
                })

                if (!existingNotification) {
                    await prisma.notification.create({
                        data: {
                            userId: user.id,
                            type: 'goal_overdue',
                            title: '期限切れの目標があります',
                            message: `「${goal.title}」の期日を過ぎています。`,
                            actionUrl: `/goals?id=${goal.id}`
                        }
                    })
                    // Web Push送信
                    await sendPushToUser(user.id, {
                        title: '期限切れの目標があります',
                        message: `「${goal.title}」の期日を過ぎています。`,
                        url: `/goals?id=${goal.id}`
                    })
                    createdCount++
                }
            }

            // 期日が近いタスクをチェック（3日以内）- scheduledDate と endDate の両方をチェック
            const upcomingTasks = await prisma.task.findMany({
                where: {
                    userId: user.id,
                    completed: false,
                    OR: [
                        {
                            scheduledDate: {
                                gte: now,
                                lte: threeDaysFromNow
                            }
                        },
                        {
                            endDate: {
                                gte: now,
                                lte: threeDaysFromNow
                            }
                        }
                    ]
                }
            })

            for (const task of upcomingTasks) {
                const existingNotification = await prisma.notification.findFirst({
                    where: {
                        userId: user.id,
                        type: 'task_reminder',
                        actionUrl: `/tasks?id=${task.id}`,
                        createdAt: {
                            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
                        }
                    }
                })

                if (!existingNotification) {
                    const dueDate = task.scheduledDate || task.endDate
                    if (dueDate) {
                        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        await prisma.notification.create({
                            data: {
                                userId: user.id,
                                type: 'task_reminder',
                                title: 'タスクの期日が近づいています',
                                message: `「${task.text}」の期日まであと ${daysUntil} 日です。`,
                                actionUrl: `/tasks?id=${task.id}`
                            }
                        })
                        // Web Push送信
                        await sendPushToUser(user.id, {
                            title: 'タスクの期日が近づいています',
                            message: `「${task.text}」の期日まであと ${daysUntil} 日です。`,
                            url: `/tasks?id=${task.id}`
                        })
                        createdCount++
                    }
                }
            }

            // 期限切れのタスクをチェック - scheduledDate と endDate の両方をチェック
            const overdueTasks = await prisma.task.findMany({
                where: {
                    userId: user.id,
                    completed: false,
                    OR: [
                        {
                            scheduledDate: {
                                lt: now
                            }
                        },
                        {
                            endDate: {
                                lt: now
                            }
                        }
                    ]
                }
            })

            for (const task of overdueTasks) {
                const existingNotification = await prisma.notification.findFirst({
                    where: {
                        userId: user.id,
                        type: 'task_overdue',
                        actionUrl: `/tasks?id=${task.id}`,
                        createdAt: {
                            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
                        }
                    }
                })

                if (!existingNotification) {
                    await prisma.notification.create({
                        data: {
                            userId: user.id,
                            type: 'task_overdue',
                            title: '期限切れのタスクがあります',
                            message: `「${task.text}」の期日を過ぎています。`,
                            actionUrl: `/tasks?id=${task.id}`
                        }
                    })
                    // Web Push送信
                    await sendPushToUser(user.id, {
                        title: '期限切れのタスクがあります',
                        message: `「${task.text}」の期日を過ぎています。`,
                        url: `/tasks?id=${task.id}`
                    })
                    createdCount++
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `${createdCount} notifications created`,
            createdCount
        })
    } catch (error) {
        console.error("POST /api/notifications/generate error:", error)
        return NextResponse.json(
            { error: "Failed to generate notifications" },
            { status: 500 }
        )
    }
}
