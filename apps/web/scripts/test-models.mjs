import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env.local');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // There isn't a direct listModels method on genAI client in some versions, 
    // but the error suggests we are using v1beta.
    // Let's try to just use the model we want and see if it works with a simple prompt.
    // If it fails, we know it's the model name.

    const modelName = 'gemini-1.5-flash';
    console.log(`Testing model: ${modelName}...`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        console.log('Success! Response:', result.response.text());
    } catch (error) {
        console.error('Error with gemini-1.5-flash:', error.message);

        console.log('\nTrying gemini-pro...');
        try {
            const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const resultPro = await modelPro.generateContent("Hello?");
            console.log('Success with gemini-pro! Response:', resultPro.response.text());
        } catch (errorPro) {
            console.error('Error with gemini-pro:', errorPro.message);
        }
    }
}

listModels();
