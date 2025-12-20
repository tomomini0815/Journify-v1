import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 単一の音声ジャーナルを取得
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const voiceJournal = await prisma.voiceJournal.findUnique({
            where: { id }
        });

        if (!voiceJournal) {
            return NextResponse.json({ error: "Voice journal not found" }, { status: 404 });
        }

        // Check ownership
        if (voiceJournal.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ voiceJournal });

    } catch (error: any) {
        console.error("Voice journal fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch voice journal", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// PATCH - 音声ジャーナルを更新
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { transcript, mood, tags } = await req.json();

        // Check ownership
        const existing = await prisma.voiceJournal.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Voice journal not found" }, { status: 404 });
        }

        if (existing.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update voice journal
        const updateData: any = {};
        if (transcript !== undefined) updateData.transcript = transcript;
        if (mood !== undefined) updateData.mood = mood;
        if (tags !== undefined) updateData.tags = tags;

        const voiceJournal = await prisma.voiceJournal.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ voiceJournal });

    } catch (error: any) {
        console.error("Voice journal update error:", error);
        return NextResponse.json(
            { error: "Failed to update voice journal", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// DELETE - 音声ジャーナルを削除
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check ownership
        const existing = await prisma.voiceJournal.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Voice journal not found" }, { status: 404 });
        }

        if (existing.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.voiceJournal.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Voice journal delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete voice journal", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
