const fs = require('fs');
const path = require('path');

async function testUpload() {
    // Create a dummy file
    const dummyPath = path.join(__dirname, 'dummy.webm');
    fs.writeFileSync(dummyPath, Buffer.from('dummy audio content'));

    const file = new Blob([fs.readFileSync(dummyPath)], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file, 'dummy.webm');

    console.log('Sending upload request...');
    try {
        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch error:', e);
    } finally {
        fs.unlinkSync(dummyPath);
    }
}

testUpload();
