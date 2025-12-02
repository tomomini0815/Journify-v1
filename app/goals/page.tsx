import { DashboardLayout } from "@/components/DashboardLayout"
import { GoalsClient } from "@/components/GoalsClient"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export default async function GoalsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    const goals = await prisma.goal.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <DashboardLayout>
            <GoalsClient initialGoals={goals} />
        </DashboardLayout>
    )
}
