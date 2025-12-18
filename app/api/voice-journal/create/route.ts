import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { audioPath } = await req.json();

        if (!audioPath) {
            return NextResponse.json({ error: "Audio path is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // Gemini APIで音声を処理
        const genAI = new GoogleGenerativeAI(apiKey);
        const fileManager = new GoogleAIFileManager(apiKey);

        console.log(`Uploading voice file: ${audioPath}`);

        // 音声ファイルをアップロード
        const uploadResponse = await fileManager.uploadFile(audioPath, {
            mimeType: "audio/webm",
            displayName: `Voice Journal ${new Date().toISOString()}`
        });

        console.log(`File uploaded: ${uploadResponse.file.uri}`);

        // 文字起こしと分析
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `この音声を文字起こしし、以下の情報を JSON 形式で返してください:

{
  "transcript": "完全な文字起こし",
  "summary": "内容の要約（2-3文）",
  "sentiment": "positive/neutral/negative のいずれか",
  "tags": ["タグ1", "タグ2", "タグ3"] // 最大5個のキーワード
}

音声の内容を正確に文字起こしし、全体的な感情とキーワードを抽出してください。
JSONのみを返し、他の説明は不要です。`;

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: prompt }
        ]);

        const responseText = result.response.text();
        console.log("Gemini response:", responseText);

        // JSONを抽出（マークダウンコードブロックを除去）
        let jsonText = responseText.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "");
        }

        const analysis = JSON.parse(jsonText);

        // 音声ジャーナルを保存
        const voiceJournal = await prisma.voiceJournal.create({
            data: {
                userId: user.id,
                audioUrl: audioPath,
                transcript: analysis.transcript,
                aiSummary: analysis.summary,
                sentiment: analysis.sentiment,
                tags: analysis.tags || []
            }
        });

        // デイリーチャレンジを更新（ジャーナル作成としてカウント）
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
        return NextResponse.json(
            { error: "Failed to create voice journal", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
