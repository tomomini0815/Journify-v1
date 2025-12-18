const fs = require('fs');
try {
    const content = fs.readFileSync('.env.local', 'utf8');
    console.log('--- START .env.local ---');
    console.log(content);
    console.log('--- END .env.local ---');
} catch (e) {
    console.error('Error reading file:', e.message);
}
