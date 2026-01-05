import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { userId, title, nodes, edges, coaching } = await req.json();

        // In a real app, userId would come from session. 
        // For this demo, we trust the client or use a default if missing? 
        // The prompt implies we have a userId context.

        // Find existing user to ensure relation is valid?
        // Assuming user exists or we are using a demo user ID. 
        // Let's assume we find the first user if userId is missing for demo purposes.
        let targetUserId = userId;
        if (!targetUserId) {
            const user = await prisma.user.findFirst();
            targetUserId = user?.id;
        }

        if (!targetUserId) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        const mindMap = await prisma.mindMap.create({
            data: {
                userId: targetUserId,
                title: title || "無題のマインドマップ",
                data: { nodes, edges },
                coaching: coaching || {}
            }
        });

        return NextResponse.json(mindMap);

    } catch (error: any) {
        console.error("Failed to save mind map:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
