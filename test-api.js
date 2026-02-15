const fetch = require('node-fetch');

async function testGenerate() {
    try {
        console.log('Testing API...');
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userRequest: 'Hello world',
                category: 'Coding',
                targetModel: 'chatgpt', // or gemini-2.0-flash-exp
                userId: 'test-user', // Mock user ID
                devBypass: true
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Raw Response:', text);

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) {
            console.log('JSON Parse Error:', e.message);
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testGenerate();
