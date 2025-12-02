import { DashboardLayout } from "@/components/DashboardLayout"
import { GoalsClient } from "@/components/GoalsClient"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// Revalidate every 30 seconds (goals change more frequently)
export const revalidate = 30

const getCachedGoals = unstable_cache(
    async (userId: string) => {
        return await prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        })
    },
    ['goals-list'],
    { revalidate: 30, tags: ['goals'] }
)

export default async function GoalsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    const goals = await getCachedGoals(user.id)

    const serializedGoals = goals.map(goal => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt)
    }))

    return (
        <DashboardLayout>
            <GoalsClient initialGoals={serializedGoals} />
        </DashboardLayout>
    )
}
