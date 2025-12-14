import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const projects = await prisma.project.findMany({
            where: { userId: user.id },
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(projects)
    } catch (error) {
        console.error("Failed to fetch projects:", error)
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, startDate, endDate, milestones } = body

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            )
        }

        // Ensure user exists in Prisma (Self-healing for dev envs)
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        if (!dbUser) {
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!, // Supabase user always has email
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                }
            })
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                userId: user.id,
            },
            include: {
                _count: {
                    select: { tasks: true }
                }
            }
        })

        // Create milestones and tasks separately to properly set projectId
        if (milestones && Array.isArray(milestones)) {
            for (const m of milestones) {
                const milestone = await prisma.milestone.create({
                    data: {
                        title: m.title,
                        date: new Date(), // Default to now, can be improved with actual dates
                        projectId: project.id,
                    }
                })

                // Create tasks with both projectId and milestoneId
                if (m.tasks && Array.isArray(m.tasks)) {
                    for (const t of m.tasks) {
                        await prisma.task.create({
                            data: {
                                text: t.text,
                                priority: t.priority || 'medium',
                                userId: user.id,
                                projectId: project.id,  // Link to project for timeline
                                milestoneId: milestone.id,  // Link to milestone
                                status: 'todo',
                            }
                        })
                    }
                }
            }
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error("Failed to create project:", error)
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        )
    }
}
