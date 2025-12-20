import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { audioPath, transcript: providedTranscript, mood } = await req.json();

        if (!audioPath) {
            return NextResponse.json({ error: "Audio path is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        let transcript = providedTranscript || "音声を認識できませんでした";
        let summary = "";
        let sentiment = "neutral";
        let tags: string[] = [];

        // Gemini APIで要約と分析のみ実行（文字起こしは既にある）
        if (transcript && transcript !== "音声を認識できませんでした") {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            const prompt = `以下のテキストを分析し、JSON形式で返してください:

{
  "summary": "内容の要約（2-3文）",
  "sentiment": "positive/neutral/negative のいずれか",
  "tags": ["タグ1", "タグ2", "タグ3"] // 最大5個のキーワード
}

テキスト:
${transcript}

JSONのみを返し、他の説明は不要です。`;

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();

                // JSONを抽出
                let jsonText = responseText.trim();
                if (jsonText.startsWith("```json")) {
                    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
                } else if (jsonText.startsWith("```")) {
                    jsonText = jsonText.replace(/```\n?/g, "");
                }

                const analysis = JSON.parse(jsonText);
                summary = analysis.summary;
                sentiment = analysis.sentiment;
                tags = analysis.tags || [];
            } catch (error) {
                console.error("Analysis error:", error);
                // フォールバック
                summary = transcript.substring(0, 100) + "...";
                tags = [];
            }
        }

        // 音声ジャーナルを保存
        const voiceJournalData: any = {
            userId: user.id,
            audioUrl: audioPath,
            transcript: transcript,
            aiSummary: summary || transcript.substring(0, 100),
            sentiment: sentiment,
            tags: tags
        };

        // Add mood if provided (TEMPORARILY DISABLED - run migration first)
        // Uncomment after running: npx prisma migrate dev --name add_voice_journal_mood
        /* if (mood !== undefined && mood !== null) {
            voiceJournalData.mood = mood;
        } */

        const voiceJournal = await prisma.voiceJournal.create({
            data: voiceJournalData
        });

        // デイリーチャレンジを更新
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.dailyChallenge.upsert({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today
                }
            },
            create: {
                userId: user.id,
                date: today,
                journalCreated: true,
                xpEarned: 10
            },
            update: {
                journalCreated: true,
                xpEarned: { increment: 10 }
            }
        });

        // XPを付与
        await prisma.userStats.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                totalXP: 10,
                totalJournals: 1
            },
            update: {
                totalXP: { increment: 10 },
                totalJournals: { increment: 1 }
            }
        });

        return NextResponse.json({
            id: voiceJournal.id,
            transcript: voiceJournal.transcript,
            summary: voiceJournal.aiSummary,
            sentiment: voiceJournal.sentiment,
            tags: voiceJournal.tags
        });

    } catch (error: any) {
        console.error("Voice journal creation error:", error);
        console.error("Error details:", {
            name: error?.name,
            message: error?.message,
            stack: error?.stack,
            code: error?.code,
            meta: error?.meta
        });

        return NextResponse.json(
            {
                error: "Failed to create voice journal",
                details: error.message,
                // Include more details in dev/debug
                debug: {
                    code: error?.code,
                    meta: error?.meta
                }
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
