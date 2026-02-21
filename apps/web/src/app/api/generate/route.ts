import { model } from '@/lib/gemini'
import { createClient } from '@/lib/supabaseServer'
import { checkSubscription, incrementUsage } from '@/lib/subscription'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// --- Validation Schemas ---
const GenerateSchema = z.object({
    userRequest: z.string().min(1).max(2000),
    category: z.string().min(1).max(100),
    targetModel: z.enum(['chatgpt', 'gemini', 'claude', 'copilot', 'perplexity', 'midjourney', 'dalle', 'stable_diffusion', 'llama', 'mistral']).optional()
})

// --- Helper: Robust JSON Extraction ---
function extractJSON(text: string): any {
    try {
        return JSON.parse(text);
    } catch {
        // pattern: code blocks
        const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlock && codeBlock[1]) {
            try { return JSON.parse(codeBlock[1]); } catch { }
        }
        // pattern: find first { and last }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch { }
        }
        throw new Error('AI response format error: Could not extract valid JSON');
    }
}

// --- Helper: Development Mock ---
const isDev = process.env.NODE_ENV === 'development';
const isLocal = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost');

// AI-specific optimization hints
const aiOptimizations: Record<string, string> = {
    chatgpt: 'Optimize for OpenAI ChatGPT. Use system/user message structure. Leverage GPT-4 capabilities.',
    gemini: 'Optimize for Google Gemini. Use natural conversational tone. Leverage multimodal understanding.',
    claude: 'Optimize for Anthropic Claude. Use XML tags for structure. Leverage long-context analysis.',
    copilot: 'Optimize for Microsoft Copilot. Focus on productivity tasks and web-grounded responses.',
    perplexity: 'Optimize for Perplexity AI. Focus on research-oriented queries with source citations.',
    midjourney: 'Optimize for Midjourney. Use descriptive visual language, artistic styles. Include --ar, --v, --style parameters.',
    dalle: 'Optimize for DALL-E. Use clear, descriptive visual prompts. Specify art style, composition, lighting.',
    stable_diffusion: 'Optimize for Stable Diffusion. Use weighted tokens (parentheses:weight), negative prompts.',
    llama: 'Optimize for Meta Llama. Use clear instruction format. Leverage coding and multilingual strengths.',
    mistral: 'Optimize for Mistral AI. Use efficient, structured prompts. Leverage European language and code strengths.',
}

function buildBasicPrompt(userRequest: string, category: string, targetAI: string): string {
    const aiHint = aiOptimizations[targetAI] || ''
    return `You are a prompt engineer.

User Request: ${userRequest}
Category: ${category}
Target AI: ${targetAI}
${aiHint ? `\nOptimization: ${aiHint}` : ''}

Return a VALID JSON object with exactly these 3 keys: "short", "detailed", "creative".
Each value should be the optimized prompt string.
Do not include markdown code block markers. Return only the raw JSON.`
}

function buildAdvancedPrompt(userRequest: string, category: string, targetAI: string): string {
    const aiHint = aiOptimizations[targetAI] || ''
    return `You are a world-class prompt engineer with deep expertise in AI optimization and ${targetAI} specifically.

ANALYSIS: Before generating, analyze the user's request for:
- Core intent and desired outcome
- Target audience
- Key constraints and requirements
- Optimal prompt structure for ${targetAI}

User Request: ${userRequest}
Category: ${category}
Target AI: ${targetAI}
${aiHint ? `\nPlatform-Specific: ${aiHint}` : ''}

GENERATION RULES:
- Each prompt must include: clear role, specific context, constraints, output format
- Use chain-of-thought reasoning where appropriate
- Include few-shot examples for complex tasks
- Apply proven prompt engineering techniques
- Optimize specifically for ${targetAI}

Generate 5 variations as a JSON object with these exact keys:
1. "short" — Concise, direct, maximum efficiency
2. "detailed" — Comprehensive with full context
3. "creative" — Unconventional angle, surprising approach
4. "professional" — Enterprise-ready, formal tone
5. "technical" — Precise, structured with clear specifications

Return a VALID JSON object. Do not include markdown code block markers. Return only the raw JSON.`
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Input Validation
        const body = await req.json()
        const parseResult = GenerateSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
        }
        const { category, userRequest, targetModel } = parseResult.data

        // 2. Authentication & Dev Bypass
        let userId = user?.id
        if (!userId && isDev && isLocal) {
            userId = 'dev-user-id'
            console.warn('⚠️ [DEV] Using mock user ID')
        }
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 3. Subscription Check
        let subscription = await checkSubscription(supabase, userId)

        // [Refactor] Mock Subscription Logic centralized
        if (userId === 'dev-user-id' && isDev) {
            const { PLANS } = await import('@/lib/plans')
            subscription = {
                ...subscription,
                canGenerate: true,
                planConfig: PLANS.unlimited,
                plan: 'unlimited',
                status: 'active'
            }
        }

        if (!subscription.canGenerate) {
            return NextResponse.json({ error: subscription.reason || 'Limit aşıldı', subscription }, { status: 403 })
        }

        // 4. Prompt Generation
        const targetAI = targetModel || 'chatgpt'

        let responseText = '';

        const prompt = subscription.planConfig.aiModelTier !== 'basic'
            ? buildAdvancedPrompt(userRequest, category, targetAI)
            : buildBasicPrompt(userRequest, category, targetAI)

        // 5. AI Execution with Retry
        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`[AI] Generating content with model... Attempt ${attempt}`);
                const resultGen = await model.generateContent(prompt);
                const text = resultGen.response.text();
                if (text) {
                    responseText = text;
                    break;
                }
            } catch (error: any) {
                console.error(`[AI] Attempt ${attempt} failed:`, error.message);
                if (attempt === maxAttempts) throw error;
                const delay = Math.pow(2, attempt - 1) * 1000;
                console.log(`[AI] Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (isDev) console.log('[AI] Raw Response:', responseText);

        let result;
        try {
            result = extractJSON(responseText);
        } catch (e) {
            // If JSON parse fails (even from mock strings if manually messed up?), fallback safe
            result = {
                short: "Error parsing AI response",
                detailed: responseText,
                creative: "..."
            }
        }

        // 6. DB Logging
        try {
            await supabase.from('profiles').upsert({ id: userId, email: user?.email || '' }, { onConflict: 'id', ignoreDuplicates: true });
            await supabase.from('generations').insert({
                user_id: userId,
                category,
                user_request: userRequest,
                tone: '',
                target_model: targetAI,
                result_json: result,
                tokens_used: 0
            });
            await incrementUsage(supabase, userId!, 'prompt');
        } catch (err: any) {
            console.error('[DB] Logging error:', err.message);
        }

        // Re-fetch sub status for UI update
        const updatedSub = await checkSubscription(supabase, userId)

        return NextResponse.json({
            ok: true,
            result,
            subscription: {
                plan: updatedSub.plan,
                status: updatedSub.status,
                monthlyPromptsUsed: updatedSub.monthlyPromptsUsed,
                monthlyPromptLimit: updatedSub.monthlyPromptLimit,
                dailyPromptsUsed: updatedSub.dailyPromptsUsed,
                dailyPromptLimit: updatedSub.dailyPromptLimit,
                monthlyUsagePercent: updatedSub.monthlyUsagePercent,
                quotaWarning: updatedSub.quotaWarning,
                isTrialActive: updatedSub.isTrialActive,
                trialDaysRemaining: updatedSub.trialDaysRemaining,
            },
            tokensUsed: 0
        })

    } catch (error: any) {
        console.error('[API] Generate Error:', error.message)
        return NextResponse.json({ error: 'AI processing failed', details: error.message }, { status: 500 })
    }
}
