
import fs from 'fs';
import path from 'path';

const logPath = path.join(process.cwd(), 'transcribe-error.log');

try {
    const data = fs.readFileSync(logPath, 'utf8');
    const lines = data.split('\n');

    // Find last line starting with [Timestamp]
    let lastErrorIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('[')) {
            lastErrorIndex = i;
            break;
        }
    }

    if (lastErrorIndex !== -1) {
        console.log("Last Error Entry:");
        // Print from that line to end or next 20 lines
        for (let i = lastErrorIndex; i < Math.min(lines.length, lastErrorIndex + 20); i++) {
            console.log(lines[i]);
        }
    } else {
        console.log("No error entries found.");
    }

} catch (e) {
    console.error("Error reading log:", e);
}
