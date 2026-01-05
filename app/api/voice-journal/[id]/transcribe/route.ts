import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile, appendFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    console.log(`=== Re-transcription Request verify for ID: ${id} ===`);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Fetch Voice Journal
        const voiceJournal = await prisma.voiceJournal.findUnique({
            where: { id }
        });

        if (!voiceJournal) {
            return NextResponse.json({ error: "Voice journal not found" }, { status: 404 });
        }

        if (voiceJournal.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!voiceJournal.audioUrl) {
            return NextResponse.json({ error: "No audio file associated with this journal" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // 2. Perform Transcription & Analysis
        console.log("Starting re-transcription...");
        let transcript = "";
        let summary = "";
        let sentiment = "neutral";
        let tags: string[] = [];

        try {
            const audioFile = await readFile(voiceJournal.audioUrl);
            const audioBase64 = audioFile.toString("base64");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            const prompt = `この音声ファイルを日本語で文字起こしし、さらに内容を分析してJSONで出力してください。

出力フォーマット:
{
  "transcript": "文字起こしされた全文",
  "summary": "内容の要約（2-3文）",
  "sentiment": "positive/neutral/negative",
  "tags": ["タグ1", "タグ2", "タグ3"]
}

JSONのみを出力してください。`;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        mimeType: "audio/webm", // Assuming webm as per upload logic
                        data: audioBase64
                    }
                }
            ]);

            const responseText = result.response.text();
            let jsonText = responseText.replace(/```json\n?|```\n?/g, "").trim();
            const analysis = JSON.parse(jsonText);

            transcript = analysis.transcript;
            summary = analysis.summary;
            sentiment = analysis.sentiment;
            tags = analysis.tags || [];

        } catch (error: any) {
            console.error("Re-transcription AI error:", error);
            // Log full error
            try {
                const logPath = path.join(process.cwd(), "server-error.log");
                const errorMsg = error instanceof Error ? error.message : String(error);
                const logEntry = `[${new Date().toISOString()}] Re-transcription Error (ID: ${id}): ${errorMsg}\n`;
                await appendFile(logPath, logEntry);
            } catch (ignore) { }

            return NextResponse.json(
                { error: "Failed to transcribe audio", details: error.message },
                { status: 500 }
            );
        }

        // 3. Update Database
        const updatedJournal = await prisma.voiceJournal.update({
            where: { id },
            data: {
                transcript,
                aiSummary: summary,
                sentiment,
                tags // Overwrite tags with new analysis? Or merge?
                // Decision: Overwrite. If user wants to keep old tags they shouldn't re-analyze.
                // Or maybe we should keep custom tags? For now, simple overwrite is consistent with "Re-do".
            }
        });

        return NextResponse.json({
            transcript: updatedJournal.transcript,
            summary: updatedJournal.aiSummary,
            sentiment: updatedJournal.sentiment,
            tags: updatedJournal.tags
        });

    } catch (error: any) {
        console.error("Re-transcription error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
