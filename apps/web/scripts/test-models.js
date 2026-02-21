const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const apiKey = envConfig.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ API Key not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const candidates = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest" // Just in case
];

async function testModel(modelName) {
    console.log(`\nTesting: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, just say 'OK'.");
        const response = await result.response;
        const text = response.text();
        console.log(`✅ SUCCESS: ${modelName}`);
        console.log(`   Response: ${text.trim()}`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Reason: ${error.message.split(']')[1] || error.message}`); // Extract cleaner message
        } else {
            console.log(`   Error: ${error.message}`);
        }
        return false;
    }
}

async function run() {
    console.log(`Key: ${apiKey.substring(0, 10)}...`);
    let working = [];

    // Run sequentially to avoid rate limits messing up tests
    for (const model of candidates) {
        const success = await testModel(model);
        if (success) working.push(model);
    }

    console.log("\n\n=== SUMMARY ===");
    if (working.length > 0) {
        console.log("🎉 Working Models:", working.join(", "));
        console.log(`RECOMMENDATION: Use '${working[0]}'`);
    } else {
        console.log("💀 No models worked. Check API Key quotas/billing.");
    }
}

run();
