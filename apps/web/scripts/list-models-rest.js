const fs = require('fs');
const path = require('path');
const https = require('https');

// Manually read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error('Error reading .env.local:', e.message);
}

if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY;
}

if (!apiKey) {
    console.error('GEMINI_API_KEY not found!');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('Fetching models from:', url.replace(apiKey, 'HIDDEN_KEY'));

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log('Available Models:');
                json.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log('Response:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.log('Raw Response:', data);
        }
    });
}).on('error', (e) => {
    console.error('Error:', e.message);
});
