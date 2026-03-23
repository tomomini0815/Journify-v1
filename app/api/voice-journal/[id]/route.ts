import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/mock-db"; // Import mock DB
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 単一の音声ジャーナルを取得
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient();
    let { data: { user } } = await supabase.auth.getUser();

    // MOCK USER for Preview/Dev environment
    if (!user && process.env.NODE_ENV === 'development') {
        user = { id: 'mock-user-123' } as any;
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const voiceJournal = await prisma.voiceJournal.findUnique({
            where: { id }
        });

        if (!voiceJournal) {
            // Mock fallback for GET
            if (process.env.NODE_ENV === 'development') {
                const mockItem = await mockDb.voiceJournals.findUnique({ where: { id } });
                if (mockItem) {
                    return NextResponse.json({ voiceJournal: mockItem });
                }
                // If not found in mock db either, we could return a default mock for very specific IDs if needed, 
                // but better to respect the DB state.
                // However, the original code had a hardcoded return. 
                // Let's keep the hardcoded check for 'mock-vj-1' as a safety net if the JSON is empty.
                if (id === 'mock-vj-1' || id.startsWith('mock-')) {
                    return NextResponse.json({
                        voiceJournal: {
                            id: id,
                            transcript: "これはAPI経由で取得したプレビュー用音声ジャーナルです。",
                            aiSummary: "AI要約のモックデータ",
                            sentiment: "positive",
                            mood: 4,
                            tags: ["mock", "api"],
                            audioUrl: "",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            userId: user.id
                        }
                    });
                }
            }
            return NextResponse.json({ error: "Voice journal not found" }, { status: 404 });
        }

        // Check ownership
        if (voiceJournal.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ voiceJournal });

    } catch (error: any) {
        console.warn("Voice journal fetch error (returning mock if dev):", error);
        console.warn("Voice journal fetch error (returning mock if dev):", error);
        if (process.env.NODE_ENV === 'development') {
            // Try to find in mock DB first in case it was a real DB connection error but we have local data
            const mockItem = await mockDb.voiceJournals.findUnique({ where: { id } });
            if (mockItem) {
                return NextResponse.json({ voiceJournal: mockItem });
            }
            return NextResponse.json({
                voiceJournal: {
                    id: id,
                    transcript: "DBエラー時のプレビュー用音声ジャーナル",
                    aiSummary: "DB接続なし",
                    sentiment: "neutral",
                    mood: 3,
                    tags: ["mock", "error-fallback"],
                    audioUrl: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: user.id
                }
            });
        }
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
    let { data: { user } } = await supabase.auth.getUser();

    // MOCK USER for Preview/Dev environment
    if (!user && process.env.NODE_ENV === 'development') {
        user = { id: 'mock-user-123' } as any;
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { transcript, mood, tags } = await req.json();

        // Check ownership
        let existing = null;
        try {
            existing = await prisma.voiceJournal.findUnique({ where: { id } });
        } catch (e) {
            console.warn("DB check failed in PATCH", e);
        }

        if (!existing) {
            // Mock fallback for PATCH logic
            // Mock fallback for PATCH logic
            if (process.env.NODE_ENV === 'development') {
                console.log("Mocking successful update for", id);
                try {
                    const updated = await mockDb.voiceJournals.update({
                        where: { id },
                        data: { transcript, mood, tags }
                    });
                    return NextResponse.json({ voiceJournal: updated });
                } catch (mockErr) {
                    // If update fails (e.g. not in mock db), fall through?
                    // Or just return the success dummy
                }

                return NextResponse.json({
                    voiceJournal: {
                        id: id,
                        transcript: transcript || "Mock transcript",
                        mood: mood || 3,
                        tags: tags || ["mock", "updated"],
                        userId: user.id,
                        updatedAt: new Date()
                    }
                });
            }
            if (existing === null) { // Only 404 if connection worked but item missing
                // If connection failed (existing is null due to catch ? no, existing is null by default),
                // verify if it was a db error or just not found using logic
                // Actually strict:
                // If DB connected but not found -> 404
                // If DB failed -> 500 usually, but here we fell through
            }
        }

        // Real update logic
        if (existing) {
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
        }

        // If we reach here in production it means DB access failed mostly or item not found handled above
        return NextResponse.json({ error: "Voice journal not found or DB unavailable" }, { status: 404 });

    } catch (error: any) {
        console.warn("Voice journal update error (returning mock success if dev):", error);
        if (process.env.NODE_ENV === 'development') {
            return NextResponse.json({
                voiceJournal: { id, status: "mock_updated" }
            });
        }
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
    let { data: { user } } = await supabase.auth.getUser();

    // MOCK USER for Preview/Dev environment
    if (!user && process.env.NODE_ENV === 'development') {
        user = { id: 'mock-user-123' } as any;
    }

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check ownership
        const existing = await prisma.voiceJournal.findUnique({
            where: { id }
        });

        if (!existing) {
            if (process.env.NODE_ENV === 'development') {
                await mockDb.voiceJournals.delete({ where: { id } }).catch(() => { });
                return NextResponse.json({ success: true });
            }
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
        console.warn("Voice journal delete error (mocking success):", error);
        if (process.env.NODE_ENV === 'development') {
            return NextResponse.json({ success: true });
        }
        return NextResponse.json(
            { error: "Failed to delete voice journal", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
