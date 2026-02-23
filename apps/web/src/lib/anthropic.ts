import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required. Set it in Vercel Dashboard → Settings → Environment Variables.')
}

const anthropic = new Anthropic({ apiKey })

export async function generateContent(prompt: string): Promise<string> {
    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
            { role: 'user', content: prompt }
        ]
    })

    const block = message.content[0]
    if (block.type === 'text') {
        return block.text
    }

    throw new Error('Unexpected response format from Anthropic')
}

export default anthropic
