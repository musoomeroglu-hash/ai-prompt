import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDlXHoLQwmt144Q9oaLBTkpeT3Nqu678KY';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not set in environment variables.');
}

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
