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
        const { title, description, startDate, endDate } = body

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            )
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                userId: user.id,
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error("Failed to create project:", error)
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        )
    }
}
