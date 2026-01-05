import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile, appendFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    console.log("=== Voice Journal POST request received (Recreated File) ===");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { audioPath, transcript: providedTranscript, mood, tags: clientTags } = await req.json();

        if (!audioPath) {
            return NextResponse.json({ error: "Audio path is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        let transcript = providedTranscript || "";
        let summary = "";
        let sentiment = "neutral";
        let aiTags: string[] = [];
        let finalTags: string[] = [];

        // Case 1: Client provided transcript -> Use text analysis
        if (transcript && transcript !== "音声を認識できませんでした") {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `以下のテキスト（ユーザーの音声ジャーナル）を分析し、JSON形式で返してください。

出力JSONフォーマット:
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

                let jsonText = responseText.replace(/```json\n?|```\n?/g, "").trim();
                const analysis = JSON.parse(jsonText);

                summary = analysis.summary;
                sentiment = analysis.sentiment;
                aiTags = analysis.tags || [];
            } catch (error) {
                console.error("Text analysis error:", error);
                summary = transcript.substring(0, 100) + "...";
            }
        }
        // Case 2: No transcript -> Use Audio analysis (Server-side Transcription)
        else {
            console.log("Transcript missing, utilizing server-side audio processing with Gemini...");
            try {
                const audioFile = await readFile(audioPath);
                const audioBase64 = audioFile.toString("base64");

                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
                            mimeType: "audio/webm",
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
                aiTags = analysis.tags || [];

            } catch (error: any) {
                console.error("Server-side audio processing failed:", error);

                try {
                    const logPath = path.join(process.cwd(), "server-error.log");
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
                    const logEntry = `[${new Date().toISOString()}] Transcription Error: ${errorMsg}\nStack: ${errorStack}\nAudio Path: ${audioPath}\n---\n`;
                    await appendFile(logPath, logEntry);
                } catch (logError) {
                    console.error("Failed to write error log:", logError);
                }

                transcript = "音声の文字起こしに失敗しました";
                summary = "音声データを処理できませんでした";
            }
        }

        // Merge client tags and AI tags (Prioritize user tags + add unique AI tags)
        finalTags = Array.from(new Set([...(clientTags || []), ...aiTags]));

        // 音声ジャーナルを保存
        const voiceJournalData: any = {
            userId: user.id,
            audioUrl: audioPath,
            transcript: transcript,
            aiSummary: summary || transcript.substring(0, 100),
            sentiment: sentiment,
            tags: finalTags
        };

        // Add numerical mood if provided
        if (mood !== undefined && mood !== null) {
            voiceJournalData.mood = mood;
        }

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
