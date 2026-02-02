import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const apiKey = process.env.GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(apiKey!)

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

        // Use Gemini 2.0 Flash for speed
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const result = await model.generateContent([
            "以下の短い音声を聞き取り、日本語で文字起こししてください。返答は文字起こしされたテキストのみを含むJSON形式で返してください。{\"text\": \"...\"}。音声が無音や雑音のみの場合は {\"text\": \"\"} を返してください。",
            {
                inlineData: {
                    mimeType: file.type || "audio/webm",
                    data: base64Audio
                }
            }
        ])

        const responseText = result.response.text()
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : "{}"
        let text = ""

        try {
            const parsed = JSON.parse(jsonStr)
            text = parsed.text || ""
        } catch (e) {
            // Fallback if JSON parsing fails, just use raw text if it looks like text
            console.warn("JSON parse failed, using raw text", responseText)
            text = responseText.replace(/```json|```/g, "").trim()
        }

        return NextResponse.json({ text })

    } catch (error: any) {
        console.error("Partial transcription error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
