
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("API key missing");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        let output = "";
        if (data.models) {
            output += "Available Models:\n";
            data.models.forEach((m: any) => {
                if (m.name.includes("flash")) {
                    output += `- ${m.name}\n`;
                }
            });
        } else {
            output += "No models found or error: " + JSON.stringify(data);
        }

        fs.writeFileSync(path.join(process.cwd(), "models_flash.txt"), output);
        console.log("Wrote models to models_flash.txt");

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
