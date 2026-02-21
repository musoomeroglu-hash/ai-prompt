import { createClient } from '@/lib/supabaseServer'
import { checkSubscription } from '@/lib/subscription'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const SubscriptionSchema = z.object({
    planType: z.enum(['free', 'starter', 'pro', 'unlimited', 'dev_starter', 'dev_pro', 'enterprise']),
    billingCycle: z.enum(['monthly', 'yearly']).optional(),
    action: z.enum(['create', 'upgrade', 'downgrade', 'cancel', 'reactivate'])
})

export const dynamic = 'force-dynamic'

// GET: Current subscription status + usage
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let subscription = await checkSubscription(supabase, user.id)

        // DEV MODE: Mock subscription for dev user
        if (user.id === 'dev-user-id' && process.env.NODE_ENV === 'development') {
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

        return NextResponse.json({ subscription })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST: Create or upgrade subscription
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const parseResult = SubscriptionSchema.safeParse(body)

        if (!parseResult.success) {
            return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
        }

        const { planType, billingCycle, action } = parseResult.data

        const now = new Date()

        if (action === 'cancel') {
            // Cancel at period end
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    cancel_at_period_end: true,
                    cancelled_at: now.toISOString(),
                    updated_at: now.toISOString(),
                })
                .eq('user_id', user.id)
                .eq('status', 'active')

            if (error) throw error

            return NextResponse.json({
                ok: true,
                message: 'Abonelik dönem sonunda iptal edilecek.'
            })
        }

        if (action === 'reactivate') {
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    cancel_at_period_end: false,
                    cancelled_at: null,
                    updated_at: now.toISOString(),
                })
                .eq('user_id', user.id)

            if (error) throw error

            return NextResponse.json({
                ok: true,
                message: 'Abonelik yeniden aktifleştirildi.'
            })
        }

        // Create/Upgrade/Downgrade: calculate period
        const cycle = billingCycle || 'monthly'
        const periodEnd = new Date(now)
        if (cycle === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        // Check if user already has a subscription
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id, plan_type, status')
            .eq('user_id', user.id)
            .in('status', ['active', 'trial'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (existingSub) {
            // Update existing
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    plan_type: planType,
                    billing_cycle: cycle,
                    status: 'active',
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: false,
                    cancelled_at: null,
                    updated_at: now.toISOString(),
                })
                .eq('id', existingSub.id)

            if (error) throw error
        } else {
            // Create new
            const { error } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    plan_type: planType,
                    billing_cycle: cycle,
                    status: 'active',
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                })

            if (error) throw error
        }

        // Also update profiles.plan
        await supabase
            .from('profiles')
            .update({ plan: planType })
            .eq('id', user.id)

        const updatedSub = await checkSubscription(supabase, user.id)

        return NextResponse.json({
            ok: true,
            message: `Plan ${planType} olarak güncellendi.`,
            subscription: updatedSub,
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
