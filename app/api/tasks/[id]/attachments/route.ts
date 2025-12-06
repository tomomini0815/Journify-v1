import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const attachments = await prisma.attachment.findMany({
            where: {
                taskId: id,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(attachments);
    } catch (error) {
        console.error("Failed to fetch attachments:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, url, size, type } = body;

        if (!name || !url) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const attachment = await prisma.attachment.create({
            data: {
                taskId: id,
                name,
                url,
                size: size || 0,
                type: type || 'application/octet-stream',
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.error("Failed to create attachment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
