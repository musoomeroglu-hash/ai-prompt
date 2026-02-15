import { model } from '@/lib/gemini'
import { createClient } from '@/lib/supabaseServer'
import { checkSubscription, incrementUsage } from '@/lib/subscription'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const GenerateSchema = z.object({
    userRequest: z.string().min(1).max(2000),
    category: z.string().min(1).max(100),
    targetModel: z.enum(['chatgpt', 'gemini', 'claude', 'copilot', 'perplexity', 'midjourney', 'dalle', 'stable_diffusion', 'llama', 'mistral']).optional()
})

export const dynamic = 'force-dynamic'

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
        const body = await req.json()
        const parseResult = GenerateSchema.safeParse(body)

        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
        }

        const { category, userRequest, targetModel } = parseResult.data

        let userId = user?.id

        // DEV MODE: Mock user if missing - HARDENED CHECK
        if (!userId && process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
            userId = 'dev-user-id'
            console.warn('⚠️ USING MOCK USER ID (DEV ONLY)')
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check subscription & quotas
        let subscription = await checkSubscription(supabase, userId)

        // DEV MODE: Override subscription for mock user
        if (userId === 'dev-user-id' && process.env.NODE_ENV === 'development') {
            const { PLANS } = await import('@/lib/plans')
            subscription = {
                plan: 'unlimited',
                planConfig: PLANS.unlimited,
                status: 'active',
                isTrialActive: false,
                trialDaysRemaining: 0,
                isSubscriptionActive: true,
                subscriptionEnd: null,
                billingCycle: 'monthly',
                isAdmin: true,
                monthlyPromptsUsed: 0,
                monthlyPromptLimit: -1,
                dailyPromptsUsed: 0,
                dailyPromptLimit: -1,
                apiCallsUsed: 0,
                apiCallsLimit: -1,
                monthlyUsagePercent: 0,
                quotaWarning: 'none',
                canGenerate: true,
            }
        }

        if (!subscription.canGenerate) {
            return NextResponse.json({
                error: subscription.reason || 'Limit aşıldı',
                subscription: {
                    plan: subscription.plan,
                    status: subscription.status,
                    monthlyPromptsUsed: subscription.monthlyPromptsUsed,
                    monthlyPromptLimit: subscription.monthlyPromptLimit,
                    dailyPromptsUsed: subscription.dailyPromptsUsed,
                    dailyPromptLimit: subscription.dailyPromptLimit,
                    quotaWarning: subscription.quotaWarning,
                    isTrialActive: subscription.isTrialActive,
                    trialDaysRemaining: subscription.trialDaysRemaining,
                }
            }, { status: 403 })
        }

        // Build prompt based on plan tier
        const targetAI = targetModel || 'chatgpt'
        const useAdvanced = subscription.planConfig.aiModelTier !== 'basic'
        const prompt = useAdvanced
            ? buildAdvancedPrompt(userRequest, category, targetAI)
            : buildBasicPrompt(userRequest, category, targetAI)

        const resultGen = await model.generateContent(prompt)
        const responseText = resultGen.response.text()
        console.log('Gemini Raw Response:', responseText);

        // Parse response
        let result;
        try {
            result = extractJSON(responseText);
        } catch (e) {
            console.error('JSON Parse Error. Raw text:', responseText);
            throw new Error('AI response format error');
        }

        // Ensure user profile exists (fixes FK constraint for generations)
        const { error: profileError } = await supabase.from('profiles').upsert(
            { id: userId, email: user?.email || '' },
            { onConflict: 'id', ignoreDuplicates: true }
        )
        if (profileError) console.error('Profile upsert error:', profileError.message)

        // Record in generations (non-blocking - don't fail the response)
        let updatedSub = subscription;
        try {
            const { error: genError } = await supabase.from('generations').insert({
                user_id: userId,
                category,
                user_request: userRequest,
                tone: '',
                target_model: targetAI,
                result_json: result,
                tokens_used: 0
            })
            if (genError) console.error('Generations insert error:', genError.message)

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

            // Update monthly usage tracking
            await incrementUsage(supabase, userId, 'prompt')

            // Re-check subscription to get updated counts for response
            updatedSub = await checkSubscription(supabase, userId)
        } catch (dbError: any) {
            console.error('DB operations error (non-fatal):', dbError.message)
        }

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
        console.error('Generate Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}

function extractJSON(text: string): any {
    try {
        // Try parsing directly
        return JSON.parse(text);
    } catch {
        // Try extracting from code blocks
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch {
                // connection to context
            }
        }
        throw new Error('Could not parse JSON response from AI');
    }
}
