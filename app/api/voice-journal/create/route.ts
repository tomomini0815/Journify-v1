import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile, appendFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();

// Helper: Extract retry delay from 429 error message
function extractRetryDelay(errorMessage: string): number {
    const match = errorMessage.match(/retry in (\d+\.?\d*)s/i)
    if (match) return Math.ceil(parseFloat(match[1]))
    return 10
}
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

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
            const modelsToTry = ["gemini-2.0-flash-lite", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-3-flash-preview"];
            let processed = false;

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

            for (const modelName of modelsToTry) {
                for (let attempt = 0; attempt < 2; attempt++) {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent(prompt);
                        const responseText = result.response.text();

                        let jsonText = responseText.replace(/```json\n?|```\n?/g, "").trim();
                        const analysis = JSON.parse(jsonText);

                        summary = analysis.summary;
                        sentiment = analysis.sentiment;
                        aiTags = analysis.tags || [];
                        processed = true;
                        break;
                    } catch (error: any) {
                        const is429 = error.message?.includes("429") || error.message?.includes("quota");
                        if (is429 && attempt === 0) {
                            const waitTime = Math.min(extractRetryDelay(error.message), 15);
                            console.warn(`Text analysis ${modelName}: 429, retrying in ${waitTime}s...`);
                            await sleep(waitTime * 1000);
                            continue;
                        }
                        console.warn(`Text analysis failed with ${modelName}:`, error.message?.substring(0, 100));
                        break;
                    }
                }
                if (processed) break;
            }

            if (!processed) {
                // If all fails, use basic fallback
                console.error("All models failed for text analysis");
                summary = transcript.substring(0, 100) + "...";
            }
        }
        // Case 2: No transcript -> Use Audio analysis (Server-side Transcription)
        else {
            console.log("Transcript missing, utilizing server-side audio processing with Gemini...");
            try {
                let audioBase64 = "";
                let mimeType = "audio/webm"; // Default

                if (audioPath.startsWith("http")) {
                    // Production: Download from URL
                    console.log(`Downloading audio for transcription: ${audioPath}`);
                    const response = await fetch(audioPath);
                    if (!response.ok) throw new Error(`Failed to download audio: ${response.status}`);
                    const arrayBuffer = await response.arrayBuffer();
                    audioBase64 = Buffer.from(arrayBuffer).toString("base64");

                    // Detect MIME from URL extension
                    if (audioPath.endsWith(".wav")) mimeType = "audio/wav";
                    else if (audioPath.endsWith(".mp4")) mimeType = "audio/mp4";
                } else {
                    // Development: Read from local filesystem
                    const audioFile = await readFile(audioPath);
                    audioBase64 = audioFile.toString("base64");

                    // Detect MIME from path extension
                    if (audioPath.endsWith(".wav")) mimeType = "audio/wav";
                    else if (audioPath.endsWith(".mp4")) mimeType = "audio/mp4";
                }

                const genAI = new GoogleGenerativeAI(apiKey);
                const modelsToTry = ["gemini-2.0-flash-lite", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-3-flash-preview"];
                let lastError = null;
                let processed = false;

                const prompt = `この音声ファイルを分析してください。
出力JSONフォーマット:
{
  "transcript": "文字起こしされた全文",
  "summary": "内容の要約（2-3文）",
  "sentiment": "positive/neutral/negative",
  "tags": ["タグ1", "タグ2", "タグ3"]
}`;

                for (const modelName of modelsToTry) {
                    for (let attempt = 0; attempt < 2; attempt++) {
                        try {
                            const model = genAI.getGenerativeModel({
                                model: modelName,
                                generationConfig: {
                                    temperature: 0.0,
                                    responseMimeType: "application/json",
                                },
                                systemInstruction: "You are a specialized Japanese transcription and analysis engine. \n1. Transcribe the audio strictly into Japanese.\n2. Analyze the content for summary, sentiment, and tags.\n3. If the audio is silent or unintelligible, return empty transcript.\n4. Do NOT hallucinate.\n5. Return ONLY valid JSON."
                            });
                            const result = await model.generateContent([
                                prompt,
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: audioBase64
                                    }
                                }
                            ]);
                            const responseText = result.response.text();

                            let jsonText = responseText.replace(/```json\n?|```\n?/g, "").trim();
                            const analysis = JSON.parse(jsonText);

                            transcript = analysis.transcript || "";
                            summary = analysis.summary || "";
                            sentiment = analysis.sentiment || "neutral";
                            aiTags = analysis.tags || [];
                            processed = true;
                            break;
                        } catch (error: any) {
                            const is429 = error.message?.includes("429") || error.message?.includes("quota");
                            if (is429 && attempt === 0) {
                                const waitTime = Math.min(extractRetryDelay(error.message), 15);
                                console.warn(`Audio analysis ${modelName}: 429, retrying in ${waitTime}s...`);
                                await sleep(waitTime * 1000);
                                continue;
                            }
                            console.warn(`Audio analysis failed with ${modelName}:`, error.message?.substring(0, 100));
                            lastError = error;
                            break;
                        }
                    }
                    if (processed) break;
                }

                if (!processed) {
                    throw lastError || new Error("All models failed for audio analysis");
                }

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
                xpEarned: 20
            },
            update: {
                journalCreated: true,
                xpEarned: { increment: 20 }
            }
        });

        // XPを付与
        await prisma.userStats.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                totalXP: 20,
                totalJournals: 1
            },
            update: {
                totalXP: { increment: 20 },
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
