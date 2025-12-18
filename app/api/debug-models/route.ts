import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "No API Key" }, { status: 500 })
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        // Access the model listing via the underlying fetch if SDK abstracts it, 
        // or use the model listing method if available.
        // The SDK usually has a way, but if not we can fetch directly.
        // SDK doesn't always expose listModels directly in the main class in older versions.
        // Let's try to fetch the list directly as a fallback to be sure.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
        const data = await response.json()

        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
