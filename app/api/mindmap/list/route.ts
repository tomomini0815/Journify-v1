import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        let targetUserId = user?.id;

        if (authError || !targetUserId) {
            // Fallback Logic (Same as Save API for consistency)
            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
                targetUserId = firstUser.id;
            } else {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const mindMaps = await prisma.mindMap.findMany({
            where: {
                userId: targetUserId
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                coaching: true, // Optional preview
                data: true
            }
        });

        return NextResponse.json(mindMaps);

    } catch (error: any) {
        console.error("Failed to fetch mind maps:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
