import { model } from '@/lib/gemini'
import { createClient } from '@/lib/supabaseServer'
import { rateLimit } from '@/lib/rateLimit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ExtensionGenerateSchema = z.object({
    userRequest: z.string().min(1).max(2000),
    category: z.string().min(1).max(100),
    tone: z.string().max(50).optional(),
    targetModel: z.string().max(50).optional()
})

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing token' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const supabase = await createClient()

        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const userId = user.id
        const body = await req.json()
        const parseResult = ExtensionGenerateSchema.safeParse(body)

        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
        }

        const { category, userRequest, tone, targetModel } = parseResult.data

        const limitResult = await rateLimit(supabase, userId, 10)

        if (!limitResult.success) {
            return NextResponse.json({
                error: 'Daily limit reached',
                remainingToday: 0
            }, { status: 429 })
        }

        const prompt = `
      You are an expert prompt engineer. 
      User Request: ${userRequest}
      Category: ${category}
      Tone: ${tone}
      Target AI: ${targetModel}
      
      Return a VALID JSON object with exactly these 3 keys: "short", "detailed", "creative".
      Clean JSON only.
    `

        const resultGen = await model.generateContent(prompt);
        const responseText = resultGen.response.text();
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanedText);

        // Record usage
        await supabase.from('generations').insert({
            user_id: userId,
            category,
            user_request: userRequest,
            tone,
            target_model: targetModel,
            result_json: result,
            tokens_used: 0
        })

        // Update daily usage
        const today = new Date().toISOString().split('T')[0]
        const { data: usage } = await supabase
            .from('daily_usage')
            .select('count')
            .eq('user_id', userId)
            .eq('date', today)
            .single()

        const currentCount = usage?.count || 0
        await supabase.from('daily_usage').upsert({
            user_id: userId,
            date: today,
            count: currentCount + 1
        })

        return NextResponse.json({
            ok: true,
            remainingToday: Math.max(0, 10 - (currentCount + 1)),
            result,
            tokensUsed: 0
        })

    } catch (error: any) {
        console.error('Extension Generate Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}
