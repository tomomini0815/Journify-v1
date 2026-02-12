import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const apiKey = process.env.GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(apiKey!)

// Helper: Extract retry delay from 429 error message
function extractRetryDelay(errorMessage: string): number {
    const match = errorMessage.match(/retry in (\d+\.?\d*)s/i)
    if (match) return Math.ceil(parseFloat(match[1]))
    return 10 // default 10 seconds
}

// Helper: Sleep for specified milliseconds
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "API key missing" }, { status: 500 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as Blob

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const base64Audio = Buffer.from(arrayBuffer).toString("base64")

        // Use a wide range of models with separate quota pools
        // Each model has its own 5 RPM limit on free tier
        const modelsToTry = [
            "gemini-2.0-flash-lite",    // Lightest, fast
            "gemini-2.5-flash-lite",    // Next gen lite
            "gemini-2.0-flash",         // Standard flash
            "gemini-3-flash-preview",   // New generation
        ];

        let lastError: any = null;

        for (const modelName of modelsToTry) {
            // Try each model, with one retry on 429
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            temperature: 0.0,
                            responseMimeType: "application/json",
                        },
                        systemInstruction: "You are a specialized Japanese transcription engine. \n1. Transcribe the audio strictly into Japanese.\n2. If the audio is silent, noise, music, or unintelligible, return {\"text\": \"\"}.\n3. Do NOT output English unless the speaker is explicitly speaking English.\n4. Do NOT hallucinate or generate text that is not in the audio.\n5. Return ONLY valid JSON."
                    });

                    const result = await model.generateContent([
                        {
                            inlineData: {
                                mimeType: file.type || "audio/webm",
                                data: base64Audio
                            }
                        }
                    ]);

                    const responseText = result.response.text();
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : "{}";
                    let text = "";

                    try {
                        const parsed = JSON.parse(jsonStr);
                        text = parsed.text || "";
                    } catch (e) {
                        console.warn(`JSON parse failed for ${modelName}, using raw text`, responseText);
                        text = responseText.replace(/```json|```/g, "").trim();
                    }

                    return NextResponse.json({ text });

                } catch (error: any) {
                    lastError = error;
                    const is429 = error.message?.includes("429") || error.message?.includes("quota");

                    if (is429 && attempt === 0) {
                        // First 429: wait and retry with the SAME model
                        const retryDelay = extractRetryDelay(error.message);
                        const waitTime = Math.min(retryDelay, 15); // Cap at 15s
                        console.warn(`Model ${modelName}: 429, retrying in ${waitTime}s...`);
                        await sleep(waitTime * 1000);
                        continue; // retry same model
                    }

                    // Log and move to next model
                    console.warn(`Model ${modelName} failed (attempt ${attempt + 1}):`, error.message?.substring(0, 100));
                    break; // exit retry loop, try next model
                }
            }
        }

        // All models failed - return graceful error (don't crash)
        console.error("Partial transcription: All models failed");

        // Log to file for debugging
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'transcribe-error.log');
            const logEntry = `[${new Date().toISOString()}] All models failed: ${lastError?.message?.substring(0, 200)}\n`;
            fs.appendFileSync(logPath, logEntry);
        } catch (e) { /* ignore */ }

        return NextResponse.json({ error: lastError?.message || "All models failed" }, { status: 500 });
    } catch (error: any) {
        console.error("Partial transcription error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
