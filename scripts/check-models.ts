import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        fs.writeFileSync('models.json', JSON.stringify(data, null, 2), 'utf-8');
        console.log("Wrote models to models.json");

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
