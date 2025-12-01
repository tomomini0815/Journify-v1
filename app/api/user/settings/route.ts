import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Mock user ID for now
const USER_ID = "user-1"

export async function GET() {
    try {
        let settings = await prisma.userSettings.findUnique({
            where: { userId: USER_ID }
        })

        if (!settings) {
            settings = await prisma.userSettings.create({
                data: {
                    userId: USER_ID,
                    enableProjects: false
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Failed to fetch user settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch user settings" },
            { status: 500 }
        )
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { enableProjects } = body

        const settings = await prisma.userSettings.upsert({
            where: { userId: USER_ID },
            update: { enableProjects },
            create: {
                userId: USER_ID,
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
