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
            let settings = await prisma.userSettings.findUnique({
                where: { userId: user.id }
            })

            console.log(`GET /api/user/settings for ${user.id}:`, settings)

            if (!settings) {
                settings = await prisma.userSettings.create({
                    data: {
                        userId: user.id,
                        enableProjects: false,
                        showJojo: true
                    }
                })
                console.log("Created default settings:", settings)
            }

            return NextResponse.json(settings)
        } catch (dbError) {
            // If database error (e.g., table doesn't exist), return default settings
            console.error("Database error, returning default settings:", dbError)
            return NextResponse.json({
                userId: user.id,
                enableProjects: false,
                showJojo: true
            })
        }
    } catch (error) {
        console.error("Failed to fetch user settings:", error)
        // Return default settings instead of error
        return NextResponse.json({
            userId: "unknown",
            enableProjects: false,
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
        const { enableProjects, showJojo } = body

        const updateData: any = {}
        if (enableProjects !== undefined) updateData.enableProjects = enableProjects
        if (showJojo !== undefined) updateData.showJojo = showJojo

        console.log(`PATCH /api/user/settings for ${user.id}:`, updateData)

        const settings = await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                enableProjects: enableProjects ?? false,
                showJojo: showJojo ?? true
            }
        })
        console.log("Updated settings:", settings)

        revalidateTag('profile')

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Failed to update user settings:", error)
        return NextResponse.json(
            { error: "Failed to update user settings" },
            { status: 500 }
        )
    }
}
