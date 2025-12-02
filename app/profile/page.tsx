import { DashboardLayout } from "@/components/DashboardLayout"
import { ProfileClient } from "@/components/ProfileClient"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// Revalidate every 5 minutes (profile data changes infrequently)
export const revalidate = 300

const getCachedProfileData = unstable_cache(
    async (userId: string) => {
        return await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    name: true,
                    email: true,
                    bio: true,
                    preferences: true
                }
            }),
            prisma.userSettings.findUnique({
                where: { userId },
                select: { enableProjects: true }
            }),
            prisma.journalEntry.count({
                where: { userId }
            }),
            prisma.goal.count({
                where: { userId, progress: 100 }
            }),
            prisma.journalEntry.findMany({
                where: { userId },
                select: { createdAt: true },
                orderBy: { createdAt: 'desc' }
            })
        ])
    },
    ['profile-data'],
    { revalidate: 300, tags: ['profile'] }
)

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null // Middleware will redirect
    }

    // Fetch profile and settings in parallel using cache
    const [profile, settings, journalCount, goalCount, allJournalDates] = await getCachedProfileData(user.id)

    // Calculate streak
    let streak = 0
    let uniqueDates = new Set<string>()

    if (allJournalDates.length > 0) {
        uniqueDates = new Set(
            allJournalDates.map(j => new Date(j.createdAt).toISOString().split('T')[0])
        )

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (uniqueDates.has(todayStr) || uniqueDates.has(yesterdayStr)) {
            let checkDate = new Date(today)

            if (!uniqueDates.has(todayStr)) {
                checkDate = yesterday
            }

            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0]
                if (uniqueDates.has(dateStr)) {
                    streak++
                    checkDate.setDate(checkDate.getDate() - 1)
                } else {
                    break
                }
            }
        }
    }

    const daysUsed = uniqueDates.size

    const initialData = {
        name: profile?.name || "",
        email: profile?.email || "",
        bio: profile?.bio || "",
        notifications: (profile?.preferences as any)?.notifications ?? true,
        emailUpdates: (profile?.preferences as any)?.emailUpdates ?? false,
        language: (profile?.preferences as any)?.language || "ja",
        enableProjects: settings?.enableProjects ?? false,
        stats: {
            journalCount,
            streak,
            goalCount,
            daysUsed
        }
    }

    return (
        <DashboardLayout>
            <ProfileClient initialData={initialData} />
        </DashboardLayout>
    )
}
