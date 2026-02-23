import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

function getClient(): Anthropic {
    if (!_client) {
        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required. Set it in Vercel Dashboard → Settings → Environment Variables.')
        }
        _client = new Anthropic({ apiKey })
    }
    return _client
}

export async function generateContent(prompt: string): Promise<string> {
    const client = getClient()
    const message = await client.messages.create({
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
