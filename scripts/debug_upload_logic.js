const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

async function testUploadLogic() {
    try {
        console.log("Starting logic test...");

        // Emulate process.cwd()
        const cwd = process.cwd();
        console.log("CWD:", cwd);

        const uploadDir = path.join(cwd, "public", "uploads");
        console.log("Target Upload Dir:", uploadDir);

        // 1. mkdir
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            console.log("mkdir success");
        } catch (e) {
            console.error("mkdir failed:", e);
            throw e;
        }

        // 2. Write file
        const filename = `${uuidv4()}-test-upload.webm`;
        const filepath = path.join(uploadDir, filename);
        console.log("Target Filepath:", filepath);

        const buffer = Buffer.from("test content");

        try {
            await fs.writeFile(filepath, buffer);
            console.log("writeFile success");
        } catch (e) {
            console.error("writeFile failed:", e);
            throw e;
        }

        // Clean up
        await fs.unlink(filepath);
        console.log("Cleanup success");

    } catch (e) {
        console.error("Logic test failed:", e);
    }
}

testUploadLogic();
