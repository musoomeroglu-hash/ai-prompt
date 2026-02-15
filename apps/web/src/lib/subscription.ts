import { SupabaseClient } from '@supabase/supabase-js'
import { PLANS, PlanType, PlanConfig } from './plans'

export interface SubscriptionStatus {
    plan: PlanType
    planConfig: PlanConfig
    status: 'active' | 'trial' | 'suspended' | 'cancelled' | 'expired'
    isTrialActive: boolean
    trialDaysRemaining: number
    isSubscriptionActive: boolean
    subscriptionEnd: string | null
    billingCycle: 'monthly' | 'yearly'
    isAdmin: boolean

    // Usage
    monthlyPromptsUsed: number
    monthlyPromptLimit: number
    dailyPromptsUsed: number
    dailyPromptLimit: number
    apiCallsUsed: number
    apiCallsLimit: number

    // Quota warnings
    monthlyUsagePercent: number
    quotaWarning: 'none' | 'warning_80' | 'warning_90' | 'exceeded'

    canGenerate: boolean
    reason?: string
}

export async function checkSubscription(
    supabase: SupabaseClient,
    userId: string
): Promise<SubscriptionStatus> {
    // Get subscription
    const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Get profile for trial info + admin check
    const { data: profile } = await supabase
        .from('profiles')
        .select('plan, trial_start, trial_end, subscription_end, role')
        .eq('id', userId)
        .single()

    // ADMIN BYPASS: admins get unlimited everything
    const isAdmin = profile?.role === 'admin'
    if (isAdmin) {
        return {
            plan: 'unlimited',
            planConfig: PLANS.unlimited,
            status: 'active',
            isTrialActive: false,
            trialDaysRemaining: 0,
            isSubscriptionActive: true,
            subscriptionEnd: null,
            billingCycle: 'yearly',
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

    const now = new Date()

    // Determine plan type
    let planType: PlanType = 'free'
    let status: SubscriptionStatus['status'] = 'expired'
    let billingCycle: 'monthly' | 'yearly' = 'monthly'
    let subscriptionEnd: string | null = null

    if (sub) {
        planType = sub.plan_type as PlanType
        billingCycle = (sub.billing_cycle as 'monthly' | 'yearly') || 'monthly'

        if (sub.status === 'active' && sub.current_period_end) {
            const periodEnd = new Date(sub.current_period_end)
            if (periodEnd > now) {
                status = 'active'
                subscriptionEnd = sub.current_period_end
            } else {
                status = 'expired'
                planType = 'free'
            }
        } else if (sub.status === 'trial') {
            const trialEnd = sub.trial_end ? new Date(sub.trial_end) : null
            if (trialEnd && trialEnd > now) {
                status = 'trial'
            } else {
                status = 'expired'
                planType = 'free'
            }
        } else if (sub.status === 'suspended') {
            status = 'suspended'
            planType = 'free'
        } else if (sub.status === 'cancelled') {
            // Cancelled but might still be in paid period
            if (sub.current_period_end && new Date(sub.current_period_end) > now) {
                status = 'active'
                subscriptionEnd = sub.current_period_end
            } else {
                status = 'cancelled'
                planType = 'free'
            }
        }
    } else if (profile) {
        // No subscription record, check profile trial
        const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null
        if (trialEnd && trialEnd > now) {
            status = 'trial'
            planType = profile.plan === 'pro' ? 'pro' : 'free'
        }
    }

    const planConfig = PLANS[planType] || PLANS.free
    const isTrialActive = status === 'trial'
    const isSubscriptionActive = status === 'active'

    // Calculate trial days remaining
    const trialEnd = sub?.trial_end || profile?.trial_end
    const trialDaysRemaining = isTrialActive && trialEnd
        ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0

    // Get monthly usage
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const { data: monthlyUsage } = await supabase
        .from('usage_tracking')
        .select('prompt_count, api_call_count')
        .eq('user_id', userId)
        .eq('period_start', periodStart)
        .single()

    const monthlyPromptsUsed = monthlyUsage?.prompt_count || 0
    const apiCallsUsed = monthlyUsage?.api_call_count || 0

    // Get daily usage
    const today = now.toISOString().split('T')[0]
    const { data: dailyUsage } = await supabase
        .from('daily_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

    const dailyPromptsUsed = dailyUsage?.count || 0

    // Determine limits
    const monthlyPromptLimit = planConfig.monthlyPromptLimit
    const dailyPromptLimit = planConfig.dailyPromptLimit
    const apiCallsLimit = planConfig.apiCallsPerMonth

    // Calculate usage percentage
    let monthlyUsagePercent = 0
    if (monthlyPromptLimit > 0) {
        monthlyUsagePercent = Math.round((monthlyPromptsUsed / monthlyPromptLimit) * 100)
    }

    // Quota warning
    let quotaWarning: SubscriptionStatus['quotaWarning'] = 'none'
    if (monthlyPromptLimit > 0) {
        if (monthlyPromptsUsed >= monthlyPromptLimit) quotaWarning = 'exceeded'
        else if (monthlyUsagePercent >= 90) quotaWarning = 'warning_90'
        else if (monthlyUsagePercent >= 80) quotaWarning = 'warning_80'
    }

    // Can generate?
    let canGenerate = false
    let reason: string | undefined

    if (status === 'suspended') {
        reason = 'Hesabınız askıya alındı. Lütfen ödeme bilgilerinizi güncelleyin.'
    } else if (status === 'expired' && !isTrialActive) {
        reason = 'Deneme süreniz doldu. Lütfen bir plan seçin.'
    } else if (monthlyPromptLimit > 0 && monthlyPromptsUsed >= monthlyPromptLimit) {
        reason = `Aylık limitiniz doldu (${monthlyPromptsUsed}/${monthlyPromptLimit}). Upgrade edin.`
    } else if (dailyPromptLimit > 0 && dailyPromptsUsed >= dailyPromptLimit) {
        reason = `Günlük limitiniz doldu (${dailyPromptsUsed}/${dailyPromptLimit}). Yarın tekrar deneyin veya upgrade edin.`
    } else {
        canGenerate = true
    }

    return {
        plan: planType,
        planConfig,
        status,
        isTrialActive,
        trialDaysRemaining,
        isSubscriptionActive,
        subscriptionEnd,
        billingCycle,
        isAdmin: false,
        monthlyPromptsUsed,
        monthlyPromptLimit,
        dailyPromptsUsed,
        dailyPromptLimit,
        apiCallsUsed,
        apiCallsLimit,
        monthlyUsagePercent,
        quotaWarning,
        canGenerate,
        reason,
    }
}

// Update monthly usage counter
export async function incrementUsage(
    supabase: SupabaseClient,
    userId: string,
    type: 'prompt' | 'api_call' | 'ai_analysis' | 'ab_test' = 'prompt'
) {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const columnMap = {
        prompt: 'prompt_count',
        api_call: 'api_call_count',
        ai_analysis: 'ai_analysis_count',
        ab_test: 'ab_test_count',
    }

    const { data: existing } = await supabase
        .from('usage_tracking')
        .select('id, prompt_count, api_call_count, ai_analysis_count, ab_test_count')
        .eq('user_id', userId)
        .eq('period_start', periodStart)
        .single()

    if (existing) {
        const col = columnMap[type]
        await supabase
            .from('usage_tracking')
            .update({ [col]: (existing as any)[col] + 1 })
            .eq('id', existing.id)
    } else {
        await supabase.from('usage_tracking').insert({
            user_id: userId,
            period_start: periodStart,
            [columnMap[type]]: 1,
        })
    }
}
