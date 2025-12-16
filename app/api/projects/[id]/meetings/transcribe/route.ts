import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { readFile } from "fs/promises"
import path from "path"

// Initialize Gemini with safety
const apiKey = process.env.GOOGLE_API_KEY
if (!apiKey) {
    console.error("Server Error: Missing GOOGLE_API_KEY environment variable.")
}
const genAI = new GoogleGenerativeAI(apiKey!)

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Await params for Next.js 15+
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "Server configuration error: Missing API Key" },
                { status: 500 }
            )
        }

        const { audioUrl } = await req.json()

        if (!audioUrl) {
            return NextResponse.json(
                { error: "Audio URL is required" },
                { status: 400 }
            )
        }

        // Read the audio file
        const audioPath = path.join(process.cwd(), "public", audioUrl)
        const audioBuffer = await readFile(audioPath)
        const audioBase64 = audioBuffer.toString('base64')

        // Try multiple models in order of preference/availability
        const modelsToTry = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-flash-latest", // Found in user's list
            "gemini-1.5-pro",
            "gemini-1.5-pro-001",
            "gemini-1.5-pro-002",
            "gemini-2.0-flash-exp"
        ]

        let lastError = null
        let result = null

        const systemPrompt = `
あなたは優秀なAI書記です。会議の音声を分析し、プロフェッショナルな議事録を作成してください。
以下のMarkdown形式で出力してください。余計な挨拶や前置きは不要です。

# [会議のタイトル（内容から自動生成）]

## 📝 要約
(会議の全体像を3-5行で簡潔にまとめてください)

## 💡 重要なポイント
- (議論の主要なポイントを箇条書きで)
- (決定事項があればここに含める)

## ✅ ネクストアクション
- [ ] (担当者名): (アクション内容) [期限]
- [ ] (具体的なタスクがあればチェックボックス形式で)

## 🗣️ 発言録（詳細文字起こし）
(可能な限り一字一句正確な文字起こしをここに記載してください。発言者が区別できる場合は「話者A: ...」のように記載してください)
`

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}...`)
                const model = genAI.getGenerativeModel({ model: modelName })

                result = await model.generateContent([
                    {
                        inlineData: {
                            mimeType: "audio/webm",
                            data: audioBase64
                        }
                    },
                    { text: systemPrompt }
                ])

                const response = await result.response
                const text = response.text()
                console.log(`Success with model: ${modelName}`)

                // Parse title if possible
                const titleMatch = text.match(/^#\s+(.+)$/m)
                const title = titleMatch ? titleMatch[1].trim() : "会議議事録"

                return NextResponse.json({
                    title,
                    content: text,
                    model: modelName
                })

            } catch (error: any) {
                console.warn(`Failed with model ${modelName}:`, error.message)
                lastError = error
                // Continue to next model
            }
        }
        console.error("All models failed. Last error:", lastError)
        return NextResponse.json(
            {
                error: "AI processing failed with all available models",
                details: lastError?.message || "Unknown error"
            },
            { status: 500 }
        )

    } catch (error: any) {
        console.error("=== Gemini API Error ===")
        console.error("Error message:", error.message)
        console.error("Full error object:", JSON.stringify(error, null, 2))

        return NextResponse.json(
            { error: error.message || "Failed to transcribe audio", details: error.toString() },
            { status: 500 }
        )
    }
}
