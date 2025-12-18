import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

export async function POST(req: NextRequest) {
    try {
        console.log("=== Upload API Called ===");

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

        // Use /tmp for Vercel serverless (read-only file system elsewhere)
        const uploadDir = path.join(os.tmpdir(), "uploads");

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

        // Return the absolute file path (for server-side processing)
        // Not a public URL since /tmp is not accessible via HTTP
        console.log(`Upload successful, path: ${filepath}`);

        return NextResponse.json({
            success: true,
            filepath, // Absolute path for server-side use
            filename, // Just the filename
            name: file.name,
            size: file.size,
            type: file.type
        });

    } catch (error: any) {
        console.error("=== Upload Error ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

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
