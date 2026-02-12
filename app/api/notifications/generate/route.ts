import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

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
