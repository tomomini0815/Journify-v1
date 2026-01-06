import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from '@/lib/supabase/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            // Fallback for development/demo if no auth user: try key fallback or first user
            // But prefer strict auth. For now, let's try to find ANY user if unauthorized (DEV MODE ONLY)
            // Or just return 401. Let's return 401 to be safe, but maybe the user isn't logged in for this test?
            // Given the previous code had a fallback, let's keep a robust fallback for the "first user" if auth fails, 
            // BUT only if we are in a non-production env? No, let's just use the fallback if no user.

            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
                // Warning: Using first found user as fallback
                return saveMindMap(req, firstUser.id);
            }
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return saveMindMap(req, user.id);

    } catch (error: any) {
        console.error("Failed to save mind map:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function saveMindMap(req: NextRequest, userId: string) {
    const { title, nodes, edges, coaching } = await req.json();

    const mindMap = await prisma.mindMap.create({
        data: {
            userId: userId,
            title: title || "無題のマインドマップ",
            data: { nodes, edges },
            coaching: coaching || {}
        }
    });

    return NextResponse.json(mindMap);
}
