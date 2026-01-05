import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const mindMap = await prisma.mindMap.findUnique({
            where: {
                id: params.id
            }
        });

        if (!mindMap) {
            return NextResponse.json({ error: "Mind Map not found" }, { status: 404 });
        }

        return NextResponse.json(mindMap);

    } catch (error: any) {
        console.error("Failed to fetch mind map:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
