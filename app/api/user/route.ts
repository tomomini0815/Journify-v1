import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        console.log("User from Supabase:", {
            id: user.id,
            email: user.email,
            metadata: user.user_metadata
        })

        // Check if user already exists in Prisma
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
        })

        if (existingUser) {
            console.log("User already exists:", existingUser.id)
            return NextResponse.json(existingUser)
        }

        // Validate email
        if (!user.email) {
            throw new Error("User email is required")
        }

        // Create user in Prisma database
        const newUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || null,
            },
        })

        console.log("Created new user:", newUser.id)
        return NextResponse.json(newUser)
    } catch (error) {
        console.error("POST /api/user error:", error)
        console.error("Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        })
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
