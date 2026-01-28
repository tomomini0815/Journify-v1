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
            const settings = await prisma.userSettings.findUnique({
                where: { userId: user.id }
            })

            console.log(`GET /api/user/settings for ${user.id}:`, settings)

            if (!settings) {
                return NextResponse.json({
                    userId: user.id,
                    enableProjects: false,
                    enableAdventure: true,
                    showJojo: true
                })
            }

            return NextResponse.json(settings)
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
        if (enableAdventure !== undefined) updateData.enableAdventure = enableAdventure

        console.log(`PATCH /api/user/settings for ${user.id}:`, updateData)

        // Check if user exists in the database
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser) {
            console.log(`User ${user.id} not found in database. Creating user record...`)
            // If user doesn't exist in Prisma (but exists in Supabase), create them
            // This can happen if the webhook failed or wasn't set up
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
                    // Add other default fields if necessary
                }
            })
        }

        // 1. Update UserSettings table
        const settings = await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                enableProjects: enableProjects ?? false,
                enableAdventure: enableAdventure ?? true,
                showJojo: showJojo ?? true
            }
        })

        revalidateTag('profile', 'max')

        return NextResponse.json(settings)
    } catch (error: any) {
        console.error("Failed to update user settings:", error)
        console.error("Error details:", error.message, error.stack)
        return NextResponse.json(
            { error: "Failed to update user settings", details: error.message },
            { status: 500 }
        )
    }
}
