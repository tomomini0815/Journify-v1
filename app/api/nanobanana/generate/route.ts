import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(req: Request) {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            console.error("Server Error: Missing GOOGLE_API_KEY environment variable.")
            return NextResponse.json(
                { error: "Server configuration error: Missing API Key" },
                { status: 500 }
            )
        }

        const { prompt, files } = await req.json()

        // Use the Gemini 1.5 Pro model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

        // enhance prompt to ensure valid SVG
        const enhancedPrompt = `
        You are an expert SVG artist. 
        Generate a beautiful, artistic, and colorful SVG image code based on this request: "${prompt}".
        
        Requirements:
        1. Output ONLY the raw <svg> code. No markdown, no "xml" declaration, no text explanations.
        2. Ensure the SVG is self-contained with xmlns="http://www.w3.org/2000/svg".
        3. Use a viewBox="0 0 512 512" (or appropriate aspect ratio).
        4. Use vibrant colors and gradients if appropriate.
        5. Make it look professional and polished.
        `

        // TODO: If files are provided, we would use gemini-pro-vision, but for now let's focus on text-to-SVG
        // and treat files as additional context (if we were using vision model).
        // Since we are using gemini-pro (text), we'll ignore file content for the V1 implementation 
        // unless we process base64 images which requires more setup.

        const result = await model.generateContent(enhancedPrompt)
        const response = await result.response
        let text = response.text()

        // Cleanup markdown code blocks if present
        text = text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim()

        // Basic validation
        if (!text.startsWith('<svg')) {
            // If it failed to produce SVG, fallback or error? 
            // Let's try to extract SVG if embedded in text
            const match = text.match(/<svg[\s\S]*?<\/svg>/)
            if (match) {
                text = match[0]
            } else {
                console.error("Gemini Output extraction failed. Got:", text)
                throw new Error("Failed to generate valid SVG format")
            }
        }

        return NextResponse.json({ svg: text })

    } catch (error: any) {
        console.error("Gemini API Error Full Details:", error)
        // Check for specific Google API errors if possible, but generic logging is a good start
        return NextResponse.json(
            { error: error.message || "Failed to generate image" },
            { status: 500 }
        )
    }
}
