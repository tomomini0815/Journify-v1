import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                name: true,
                email: true,
                bio: true,
                avatarUrl: true,
                preferences: true,
            },
        })

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(userProfile)
    } catch (error) {
        console.error("Profile API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, bio, preferences } = body

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name,
                bio,
                preferences,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Profile API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
