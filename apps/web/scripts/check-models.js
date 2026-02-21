const { GoogleGenerativeAI } = require('@google/generative-ai');

// Hardcoded key from user
const apiKey = 'AIzaSyDlXHoLQwmt144Q9oaLBTkpeT3Nqu678KY';

async function listModels() {
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Note: listModels is on the GoogleGenerativeAI instance or we might need to access it differently
        // The SDK structure usually exposes it via a manager or we can check via a simple model call
        // Actually, looking at SDK docs (mental check), usually it's not directly exposed on genAI instance in all versions.
        // Let's try to infer it or just try a standard one like 'gemini-pro' to see if IT works.

        // Attempting to use the model manager if available, or just standard fetch to the API endpoint if SDK doesn't expose list readily in this version.
        // Let's use raw fetch to be sure.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        const fs = require('fs');
        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
        } else {
            fs.writeFileSync('models.json', JSON.stringify(data.models.map(m => m.name), null, 2));
            console.log('Models written to models.json');
        }
    } catch (error) {
        console.error('Script Error:', error);
    }
}

listModels();
