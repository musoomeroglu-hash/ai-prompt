import { SupabaseClient } from '@supabase/supabase-js'

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Database-backed rate limiting that works with Vercel serverless.
 * Uses daily_usage table instead of in-memory Map.
 */
export async function rateLimit(
    supabase: SupabaseClient,
    userId: string,
    limit: number = 50,
): Promise<RateLimitResult> {
    const today = new Date().toISOString().split('T')[0]

    // Get or create today's usage record
    const { data: existing } = await supabase
        .from('daily_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

    const currentCount = existing?.count || 0
    const success = currentCount < limit

    // Increment if under limit
    if (success) {
        if (existing) {
            await supabase
                .from('daily_usage')
                .update({ count: currentCount + 1 })
                .eq('user_id', userId)
                .eq('date', today)
        } else {
            await supabase
                .from('daily_usage')
                .insert({ user_id: userId, date: today, count: 1 })
        }
    }

    // Reset at midnight UTC
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const resetMs = tomorrow.getTime()

    return {
        success,
        limit,
        remaining: Math.max(0, limit - (currentCount + (success ? 1 : 0))),
        reset: resetMs,
    }
}
