import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const validDashboardCards = new Set([
    "voice",
    "summary",
    "charts",
    "tasks",
    "goals",
    "journals",
    "daily",
    "adventure",
])

function normalizeOrder(order: unknown) {
    if (!Array.isArray(order)) return []

    const unique = new Set<string>()
    for (const id of order) {
        if (typeof id === "string" && validDashboardCards.has(id)) {
            unique.add(id)
        }
    }

    return Array.from(unique)
}

export async function GET() {
    const supabase = await createClient()
    let { data: { user }, error } = await supabase.auth.getUser()

    if ((!user || error) && process.env.NODE_ENV === "development") {
        user = {
            id: "mock-user-123",
            email: "mock@example.com",
            user_metadata: { full_name: "Mock User" },
        } as any
        error = null
    }

    if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { preferences: true },
        })

        const preferences = (dbUser?.preferences as any) || {}
        return NextResponse.json({
            order: normalizeOrder(preferences.dashboardCardOrder),
        })
    } catch (error) {
        console.warn("Failed to fetch dashboard layout, using client fallback:", error)
        return NextResponse.json({ order: [], persisted: false })
    }
}

export async function PATCH(req: Request) {
    const supabase = await createClient()
    let { data: { user }, error } = await supabase.auth.getUser()

    if ((!user || error) && process.env.NODE_ENV === "development") {
        user = {
            id: "mock-user-123",
            email: "mock@example.com",
            user_metadata: { full_name: "Mock User" },
        } as any
        error = null
    }

    if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const order = normalizeOrder(body.order)

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { preferences: true },
        })

        if (!dbUser) {
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
                    preferences: { dashboardCardOrder: order },
                },
            })
        } else {
            const preferences = (dbUser.preferences as any) || {}
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    preferences: {
                        ...preferences,
                        dashboardCardOrder: order,
                    },
                },
            })
        }
    } catch (error) {
        console.warn("Failed to persist dashboard layout to database:", error)
        return NextResponse.json({ order, persisted: false })
    }

    revalidateTag("dashboard", "max")
    revalidateTag("settings", "max")
    revalidatePath("/dashboard")

    return NextResponse.json({ order, persisted: true })
}
