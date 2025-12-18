import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleAIFileManager } from "@google/generative-ai/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { readFile, unlink } from "fs/promises"
import path from "path"

// Initialize Gemini with safety
const apiKey = process.env.GOOGLE_API_KEY
if (!apiKey) {
    console.error("Server Error: Missing GOOGLE_API_KEY environment variable.")
}
const genAI = new GoogleGenerativeAI(apiKey!)
const fileManager = new GoogleAIFileManager(apiKey!)

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

        const { audioUrl, audioData } = await req.json()

        if (!audioUrl && !audioData) {
            return NextResponse.json(
                { error: "Audio data or URL is required" },
                { status: 400 }
            )
        }

        // Try multiple models in order of preference/availability
        // Strategy: Start with premium models, fall back to smaller Gemma models if quota exceeded
        const modelsToTry = [
            "gemini-3-pro-preview", // Latest preview (Dec 2025) - highest quality
            "gemini-2.5-pro", // Stable high-quality
            "gemini-2.0-flash", // Fast fallback
            "gemini-flash-latest", // Generic flash alias
            // Gemma models - smaller, separate quota pools, more likely available
            "gemma-3-27b-it", // Largest Gemma (27B parameters)
            "gemma-3-12b-it", // Medium Gemma (12B parameters)
            "gemma-3-4b-it"   // Smallest Gemma (4B parameters) - last resort
        ]

        let errors: string[] = []
        let result = null
        let uploadedFileUri = null

        const systemPrompt = `
あなたはプロフェッショナルなAI書記です。提供された会議の音声ファイルを分析し、精度の高い議事録と文字起こしを作成してください。

**重要な指示:**
1. **正確性**: 音声の内容を正確に聞き取り、捏造や幻覚（ハルシネーション）を含めないでください。聞き取れない箇所は推測せず、文脈から自然に補完するか、重要でない場合は省略してください。
2. **話者分離**: 可能な限り話者を区別し（話者A, 話者B... または役職などで）、発言内容を明確にしてください。
3. **ノイズ除去**: 言い淀み（「あー」「えー」など）や無意味な繰り返しは取り除き、読みやすい文章に整えてください（ケバ取り）。
4. **フォーマット**: 以下のMarkdown形式を厳守してください。

出力フォーマット:
# [会議のタイトル（内容から具体的かつ簡潔に）]

## 📝 エグゼクティブサマリー
(会議の目的、決定事項、重要な結論を3-5行で要約。忙しい人が読んで一発で分かるように)

## 💡 主要な議論ポイント
- (議論のトピックごとに要点をまとめる)
- (重要な発言や意思決定の経緯)

## ✅ 決定事項・ネクストアクション
- [ ] (担当者): (タスク内容) [期限: YYYY/MM/DD]
- (決定された方針や合意事項)

## 🗣️ 全文文字起こし
(ここには、ケバ取りを行った上での詳細な会話ログを記載してください。話者ごとの対話形式で。)
`

        // Handle Audio Source
        // Strategy: If URL, use File API (supports large files). If Base64, use Inline Data (limit 20MB).

        let requestParts: any[] = []

        if (audioUrl) {
            // Local file path
            const audioPath = path.join(process.cwd(), "public", audioUrl)

            try {
                // Upload to Google AI File Manager
                console.log(`Uploading file to Gemini: ${audioPath}`)
                const uploadResponse = await fileManager.uploadFile(audioPath, {
                    mimeType: "audio/webm", // Assuming webm from recorder
                    displayName: `Meeting Audio ${new Date().toISOString()}`
                })

                uploadedFileUri = uploadResponse.file.uri
                console.log(`File uploaded: ${uploadedFileUri}`)

                // Wait for processing to be ACTIVE (Audio is usually instant, but good practice)
                let fileState = await fileManager.getFile(uploadResponse.file.name)
                while (fileState.state === "PROCESSING") {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    fileState = await fileManager.getFile(uploadResponse.file.name)
                }

                if (fileState.state === "FAILED") {
                    throw new Error("Audio processing failed by Gemini")
                }

                requestParts = [
                    {
                        fileData: {
                            mimeType: uploadResponse.file.mimeType,
                            fileUri: uploadedFileUri
                        }
                    },
                    { text: systemPrompt }
                ]

            } catch (error: any) {
                console.error("File Manager Upload Failed:", error)
                // Fallback to reading file and sending base64 (if small enough)
                const audioBuffer = await readFile(audioPath)
                const audioBase64 = audioBuffer.toString('base64')
                requestParts = [
                    {
                        inlineData: {
                            mimeType: "audio/webm",
                            data: audioBase64
                        }
                    },
                    { text: systemPrompt }
                ]
            }

        } else if (audioData) {
            const audioBase64 = audioData.replace(/^data:.+;base64,/, "")
            requestParts = [
                {
                    inlineData: {
                        mimeType: "audio/webm",
                        data: audioBase64
                    }
                },
                { text: systemPrompt }
            ]
        }

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}...`)
                const model = genAI.getGenerativeModel({ model: modelName })

                result = await model.generateContent(requestParts)

                const response = await result.response
                const text = response.text()
                console.log(`Success with model: ${modelName}`)

                // Parse title if possible
                const titleMatch = text.match(/^#\s+(.+)$/m)
                const title = titleMatch ? titleMatch[1].trim() : "会議議事録"

                // Cleanup File API
                if (uploadedFileUri) {
                    try {
                        // In production, we should store this and delete later.
                    } catch (e) { console.error("Cleanup failed", e) }
                }

                return NextResponse.json({
                    title,
                    content: text,
                    model: modelName
                })

            } catch (error: any) {
                console.warn(`Failed with model ${modelName}:`, error.message)

                // Check for quota errors (429)
                if (error.message?.includes("429") || error.message?.includes("quota")) {
                    errors.push(`${modelName}: API利用制限に達しました`)
                } else {
                    errors.push(`${modelName}: ${error.message}`)
                }
                // Continue to next model
            }
        }

        console.error("All models failed. Errors:", errors)

        // Check if all errors are quota-related
        const allQuotaErrors = errors.every(e => e.includes("利用制限") || e.includes("quota"))

        if (allQuotaErrors) {
            return NextResponse.json(
                {
                    error: "すべてのAIモデル（Gemini/Gemmaを含む）の利用制限に達しました。しばらく時間をおいてから再度お試しください。",
                    details: "頻繁に利用される場合は、Google AI Studioで有料プランへのアップグレードをご検討ください: https://ai.google.dev/pricing",
                    retryAfter: 60 // seconds
                },
                { status: 429 }
            )
        }

        return NextResponse.json(
            {
                error: "すべてのAIモデルで処理に失敗しました。",
                details: errors.join(" | ")
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
