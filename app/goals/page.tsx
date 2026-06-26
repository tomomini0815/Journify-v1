import { DashboardLayout } from "@/components/DashboardLayout"
import { GoalsClient } from "@/components/GoalsClient"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// Revalidate every 30 seconds (goals change more frequently)
export const revalidate = 30

const getCachedGoals = unstable_cache(
    async (userId: string) => {
        try {
            return await prisma.goal.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            })
        } catch (error) {
            console.warn("DB Error in getCachedGoals, returning empty list")
            return []
        }
    },
    ['goals-list'],
    { revalidate: 30, tags: ['goals'] }
)

export default async function GoalsPage() {
    const supabase = await createClient()
    let { data: { user } } = await supabase.auth.getUser()

    if (!user && process.env.NODE_ENV === 'development') {
        user = { id: 'mock-user-123' } as any
    }

    if (!user) return null // Middleware will redirect

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
