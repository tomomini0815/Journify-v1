import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ProjectsClient from "./ProjectsClient"

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const projects = await prisma.project.findMany({
        where: { userId: user.id },
        include: {
            _count: {
                select: { tasks: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    // Serialize dates to strings
    const serializedProjects = projects.map(project => ({
        ...project,
        startDate: project.startDate ? project.startDate.toISOString() : null,
        endDate: project.endDate ? project.endDate.toISOString() : null,
    }))

    return <ProjectsClient initialProjects={serializedProjects} />
}
