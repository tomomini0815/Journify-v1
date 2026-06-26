import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import ProjectsClient from "./ProjectsClient"

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const supabase = await createClient()
    let { data: { user } } = await supabase.auth.getUser()

    if (!user && process.env.NODE_ENV === 'development') {
        user = { id: 'mock-user-123' } as any
    }

    if (!user) return null

    let projects: any[] = []
    try {
        projects = await prisma.project.findMany({
            where: { userId: user.id },
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })
    } catch (error) {
        console.warn("ProjectsPage: DB Error, returning empty list")
    }

    // Serialize dates to strings
    const serializedProjects = projects.map(project => ({
        ...project,
        startDate: project.startDate ? project.startDate.toISOString() : null,
        endDate: project.endDate ? project.endDate.toISOString() : null,
    }))

    return <ProjectsClient initialProjects={serializedProjects} />
}
