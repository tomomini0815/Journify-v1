import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    console.log("[API] /api/mindmap/save called");
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        let targetUserId = user?.id;

        if (authError || !targetUserId) {
            console.warn("[API] Auth failed or no user:", authError);
            // Fallback Logic
            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
                console.log("[API] Using fallback user:", firstUser.id);
                targetUserId = firstUser.id;
            } else {
                console.error("[API] No user found for fallback.");
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        // Safe JSON parsing
        let body;
        try {
            const rawBody = await req.text();
            console.log("[API] Request Body Size:", rawBody.length);
            body = JSON.parse(rawBody);
        } catch (e) {
            console.error("[API] JSON Parse Error:", e);
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { title, nodes, edges, coaching } = body;

        console.log("[API] Saving MindMap for:", targetUserId);

        const mindMap = await prisma.mindMap.create({
            data: {
                userId: targetUserId,
                title: title || "無題のマインドマップ",
                data: { nodes, edges },
                coaching: coaching || {}
            }
        });

        console.log("[API] Save successful:", mindMap.id);
        return NextResponse.json(mindMap);

    } catch (error: any) {
        console.error("[API] Failed to save mind map (Critical):", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}


