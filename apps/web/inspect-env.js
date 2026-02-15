const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('--- Start of .env.local ---');
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const code = content.charCodeAt(i);
        // Print char (if printable) and its code
        const displayChar = code >= 32 && code <= 126 ? char : `<${code}>`;
        process.stdout.write(`${displayChar}[${code}] `);
        if (char === '\n') console.log();
    }
    console.log('\n--- End of .env.local ---');
} catch (err) {
    console.error('Error reading .env.local:', err);
}
