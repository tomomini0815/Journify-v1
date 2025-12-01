import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Mock user ID for now - in production this would come from auth session
const USER_ID = "user-1"

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: USER_ID },
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
                userId: USER_ID,
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
