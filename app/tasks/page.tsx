import { DashboardLayout } from "@/components/DashboardLayout"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { TasksClient } from "@/components/TasksClient"

export default async function TasksPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    const tasks = await prisma.task.findMany({
        where: {
            userId: user.id,
            projectId: null  // Only show daily tasks
        },
        orderBy: { createdAt: "desc" },
    })

    // Serialize dates
    const serializedTasks = tasks.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        scheduledDate: task.scheduledDate?.toISOString() || null
    }))

    return (
        <DashboardLayout>
            <TasksClient initialTasks={serializedTasks} />
        </DashboardLayout>
    )
}
