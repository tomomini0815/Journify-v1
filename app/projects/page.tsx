import prisma from "@/lib/prisma"
import ProjectsClient from "./ProjectsClient"

// Mock user ID for now - in production this would come from auth session
const USER_ID = "42c1eda0-18f2-4213-86b0-55b47ee003f3"

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
    const projects = await prisma.project.findMany({
        where: { userId: USER_ID },
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
