import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

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

        let settings = await prisma.userSettings.findUnique({
            where: { userId: user.id }
        })

        if (!settings) {
            settings = await prisma.userSettings.create({
                data: {
                    userId: user.id,
                    enableProjects: false
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Failed to fetch user settings:", error)
        return NextResponse.json(
            {
                error: "Failed to fetch user settings",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
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
        const { enableProjects } = body

        const settings = await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: { enableProjects },
            create: {
                userId: user.id,
                enableProjects
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Failed to update user settings:", error)
        return NextResponse.json(
            { error: "Failed to update user settings" },
            { status: 500 }
        )
    }
}
