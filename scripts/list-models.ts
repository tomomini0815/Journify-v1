import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error(".env.local not found at " + envPath);
}

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No GOOGLE_API_KEY found in process.env");
        return;
    }

    console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

    // Fetch directly to bypass SDK mapping issues if any
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("=== Available Models ===");
        if (data.models) {
            data.models.forEach((m: any) => console.log(`- ${m.name} (${m.version}) [Methods: ${m.supportedGenerationMethods?.join(', ')}]`));
        } else {
            console.log("No models found or error response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

listModels();
