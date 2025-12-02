import { DashboardLayout } from "@/components/DashboardLayout"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { TasksClient } from "@/components/TasksClient"
import { unstable_cache } from "next/cache"

// Revalidate every 30 seconds
export const revalidate = 30

const getCachedTasks = unstable_cache(
    async (userId: string) => {
        return await prisma.task.findMany({
            where: {
                userId,
                projectId: null  // Only show daily tasks
            },
            orderBy: { createdAt: "desc" },
        })
    },
    ['tasks-list'],
    { revalidate: 30, tags: ['tasks'] }
)

export default async function TasksPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    const tasks = await getCachedTasks(user.id)

    // Serialize dates
    const serializedTasks = tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt).toISOString(),
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate).toISOString() : null
    }))

    return (
        <DashboardLayout>
            <TasksClient initialTasks={serializedTasks} />
        </DashboardLayout>
    )
}
