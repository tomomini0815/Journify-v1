import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { grantXP } from "@/lib/game/rewardSystem"

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
        const existingTask = await prisma.task.findUnique({
            where: { id, userId: user.id },
        })

        if (!existingTask) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        const { text, description, url, status, priority, completed, color, startDate, endDate, scheduledDate } = body

        const task = await prisma.task.update({
            where: { id },
            data: {
                text,
                description,
                url,
                status,
                priority,
                completed,
                color,
                startDate: startDate ? new Date(startDate) : startDate === null ? null : undefined,
                endDate: endDate ? new Date(endDate) : endDate === null ? null : undefined,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : scheduledDate === null ? null : undefined,
            },
        })

        // Handle Rewards on Completion
        if (status === 'done' && !existingTask.completed) {
            // Calculate Rewards based on Priority
            let xp = 0
            let gold = 0
            let crystals = 0

            switch (priority || existingTask.priority) {
                case 'urgent':
                    xp = 100
                    gold = 50
                    crystals = 5
                    break
                case 'high':
                    xp = 50
                    gold = 20
                    crystals = 3
                    break
                case 'medium':
                    xp = 30
                    gold = 10
                    crystals = 1
                    break
                case 'low':
                default:
                    xp = 10
                    gold = 5
                    crystals = 0 // Low priority tasks might not give crystals to prevent spam
                    break
            }

            // Fetch User Stats
            const userStats = await prisma.userStats.findUnique({
                where: { userId: user.id }
            })

            if (userStats) {
                // Calculate Level Up using grantXP logic
                // We need to cast userStats to match the expected type if needed, or just pass relevant fields
                const { updatedStats } = grantXP(userStats as any, xp)

                // Update Stats
                await prisma.userStats.update({
                    where: { userId: user.id },
                    data: {
                        totalXP: updatedStats.totalXP,
                        level: updatedStats.level,
                        xp: updatedStats.xp,
                        gold: { increment: gold + (updatedStats.gold ? (updatedStats.gold - userStats.gold) : 0) }, // Add task gold + level up gold
                        crystals: { increment: crystals + (updatedStats.crystals ? (updatedStats.crystals - userStats.crystals) : 0) }, // Add task crystals + level up crystals
                        totalTasks: { increment: 1 },
                        lastXPUpdate: new Date()
                    }
                })
            }
        }

        revalidateTag('tasks', 'max')
        revalidateTag('dashboard', 'max')

        return NextResponse.json(task)
    } catch (error) {
        console.error("Tasks API Error:", error)
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
        const existingTask = await prisma.task.findUnique({
            where: { id, userId: user.id },
        })

        if (!existingTask) {
            return NextResponse.json({ error: "Not found" }, { status: 404 })
        }

        await prisma.task.delete({
            where: { id },
        })

        revalidateTag('tasks', 'max')
        revalidateTag('dashboard', 'max')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Tasks API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
