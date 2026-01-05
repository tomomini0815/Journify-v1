import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Mock getting userId from session/query
        const user = await prisma.user.findFirst();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        const mindMaps = await prisma.mindMap.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                coaching: true // Optional preview
            }
        });

        return NextResponse.json(mindMaps);

    } catch (error: any) {
        console.error("Failed to fetch mind maps:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
