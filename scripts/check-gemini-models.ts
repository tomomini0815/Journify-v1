
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("GOOGLE_API_KEY not found in .env.local");
    process.exit(1);
}

async function listModels() {
    console.log("--- START MODEL LIST CHECK ---");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.log(`[FAIL] ListModels returned ${response.status}:`);
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log("[PASS] Available Models:");
            if (data.models) {
                const geminiModels = data.models.filter((m: any) => m.name.toLowerCase().includes("gemini"));
                if (geminiModels.length > 0) {
                    geminiModels.forEach((m: any) => console.log(` - ${m.name}`));
                } else {
                    console.log("No Gemini models found! (Other models were present)");
                    // Print first 5 other models just to see
                    data.models.slice(0, 5).forEach((m: any) => console.log(` [Other] ${m.name}`));
                }
            } else {
                console.log("No models found in response.");
                console.log(JSON.stringify(data, null, 2));
            }
        }
    } catch (error: any) {
        console.log(`[FAIL] Network error listing models:`);
        console.log(error.message);
    }
    console.log("--- END MODEL LIST CHECK ---");
}

listModels();
