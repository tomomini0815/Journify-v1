import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, appendFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_STORAGE_BUCKET = "uploads";

export async function POST(req: NextRequest) {
    try {
        console.log("=== Upload API Called ===");
        console.log("Environment:", IS_PRODUCTION ? "production" : "development");

        const formData = await req.formData();
        console.log("FormData parsed successfully");

        const file = formData.get("file") as File;

        if (!file) {
            console.error("No file in formData");
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        console.log(`File received: ${file.name}, size: ${file.size}, type: ${file.type}`);

        const buffer = Buffer.from(await file.arrayBuffer());
        console.log(`Buffer created: ${buffer.length} bytes`);

        const filename = `${uuidv4()}-${file.name.replace(/\s/g, "-")}`;

        if (IS_PRODUCTION) {
            // Production: Use Supabase Storage
            console.log("Using Supabase Storage for production...");

            const supabase = await createClient();

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(SUPABASE_STORAGE_BUCKET)
                .upload(filename, buffer, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) {
                console.error("Supabase Storage error:", error);
                throw new Error(`Supabase Storage error: ${error.message}`);
            }

            console.log("Supabase Storage upload successful:", data);

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from(SUPABASE_STORAGE_BUCKET)
                .getPublicUrl(filename);

            const publicUrl = publicUrlData.publicUrl;
            console.log(`Upload successful, url: ${publicUrl}`);

            return NextResponse.json({
                success: true,
                filepath: publicUrl, // For production, filepath is the public URL
                url: publicUrl,
                filename,
                name: file.name,
                size: file.size,
                type: file.type
            });

        } else {
            // Development: Use local filesystem
            console.log("Using local filesystem for development...");

            const uploadDir = path.join(process.cwd(), "public", "uploads");
            console.log(`Upload directory: ${uploadDir}`);
            console.log(`Target filename: ${filename}`);

            try {
                await mkdir(uploadDir, { recursive: true });
                console.log("Upload directory created/verified");
            } catch (e: any) {
                console.warn("mkdir warning (may already exist):", e.message);
            }

            const filepath = path.join(uploadDir, filename);
            console.log(`Writing to: ${filepath}`);

            try {
                await writeFile(filepath, buffer);
                console.log("File written successfully");
            } catch (writeError: any) {
                console.error("File write error:", writeError);
                throw new Error(`Failed to write file: ${writeError.message}`);
            }

            const publicUrl = `/uploads/${filename}`;
            console.log(`Upload successful, path: ${filepath}, url: ${publicUrl}`);

            return NextResponse.json({
                success: true,
                filepath,
                url: publicUrl,
                filename,
                name: file.name,
                size: file.size,
                type: file.type
            });
        }

    } catch (error: any) {
        console.error("=== Upload Error ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        // Only try to write to local log in development
        if (!IS_PRODUCTION) {
            try {
                const logPath = path.join(process.cwd(), "server-error.log");
                const errorMsg = error instanceof Error ? error.message : String(error);
                const errorStack = error instanceof Error ? error.stack : 'No stack trace';
                const logEntry = `[${new Date().toISOString()}] Upload Error: ${errorMsg}\nStack: ${errorStack}\n---\n`;
                await appendFile(logPath, logEntry);
            } catch (logError) {
                console.error("Failed to write error log:", logError);
            }
        }

        return NextResponse.json(
            {
                error: "ファイルのアップロードに失敗しました",
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

