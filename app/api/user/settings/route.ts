import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        try {
            // Fetch User settings and User preferences in parallel
            const [settings, userData] = await Promise.all([
                prisma.userSettings.findUnique({ where: { userId: user.id } }),
                prisma.user.findUnique({
                    where: { id: user.id },
                    select: { preferences: true }
                })
            ])

            console.log(`GET /api/user/settings for ${user.id}:`, settings)

            // Parse preferences for enableAdventure - use exact value from DB
            const preferences = (userData?.preferences as any) || {}
            console.log(`[API debug] User preferences:`, JSON.stringify(preferences))

            // Only default to true if preferences has never been set
            const enableAdventure = 'enableAdventure' in preferences ? preferences.enableAdventure : true
            console.log(`[API debug] Resolved enableAdventure:`, enableAdventure)

            if (!settings) {
                // Return default with enableAdventure
                return NextResponse.json({
                    userId: user.id,
                    enableProjects: false,
                    enableAdventure: enableAdventure,
                    showJojo: true
                })
            }

            return NextResponse.json({
                ...settings,
                enableAdventure // Inject from preferences
            })
        } catch (dbError) {
            console.error("Database error, returning default settings:", dbError)
            return NextResponse.json({
                userId: user.id,
                enableProjects: false,
                enableAdventure: true,
                showJojo: true
            })
        }
    } catch (error) {
        console.error("Failed to fetch user settings:", error)
        return NextResponse.json({
            userId: "unknown",
            enableProjects: false,
            enableAdventure: true,
            showJojo: true
        })
    }
}

export async function PATCH(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { enableProjects, enableAdventure, showJojo } = body

        const updateData: any = {}
        if (enableProjects !== undefined) updateData.enableProjects = enableProjects
        if (showJojo !== undefined) updateData.showJojo = showJojo

        console.log(`PATCH /api/user/settings for ${user.id}:`, updateData)

        // 1. Update UserSettings table
        const settings = await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                enableProjects: enableProjects ?? false,
                showJojo: showJojo ?? true
            }
        })

        // 2. Update User preferences if enableAdventure is provided
        if (enableAdventure !== undefined) {
            // Fetch existing preferences first to merge
            const currentUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { preferences: true }
            })

            const currentPrefs = (currentUser?.preferences as any) || {}
            const newPrefs = { ...currentPrefs, enableAdventure }

            await prisma.user.update({
                where: { id: user.id },
                data: { preferences: newPrefs }
            })
            console.log("Updated User preferences:", newPrefs)
        }

        revalidateTag('profile', 'max')

        return NextResponse.json({
            ...settings,
            enableAdventure: enableAdventure !== undefined ? enableAdventure : (settings as any).enableAdventure
        })
    } catch (error: any) {
        console.error("Failed to update user settings:", error)
        console.error("Error details:", error.message, error.stack)
        return NextResponse.json(
            { error: "Failed to update user settings", details: error.message },
            { status: 500 }
        )
    }
}
