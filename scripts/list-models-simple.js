const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('API Key present:', !!apiKey);

    if (!apiKey) {
        console.log("No API Key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.models) {
            const output = data.models.map(m => `MODEL: ${m.name} | Version: ${m.version}`).join('\n');
            fs.writeFileSync('models_log.txt', output);
            console.log('Written to models_log.txt');
        } else {
            console.log('API RESPONSE ERROR:', JSON.stringify(data));
            fs.writeFileSync('models_log.txt', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('ERROR:', e.message);
        fs.writeFileSync('models_log.txt', 'ERROR: ' + e.message);
    }
}

listModels();
