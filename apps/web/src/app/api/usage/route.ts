import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

        // Monthly usage
        const { data: monthly } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', user.id)
            .eq('period_start', periodStart)
            .single()

        // Daily usage
        const today = now.toISOString().split('T')[0]
        const { data: daily } = await supabase
            .from('daily_usage')
            .select('count')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

        // Usage history (last 6 months)
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]
        const { data: history } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', user.id)
            .gte('period_start', sixMonthsAgo)
            .order('period_start', { ascending: false })

        return NextResponse.json({
            current: {
                monthly: {
                    promptCount: monthly?.prompt_count || 0,
                    apiCallCount: monthly?.api_call_count || 0,
                    aiAnalysisCount: monthly?.ai_analysis_count || 0,
                    abTestCount: monthly?.ab_test_count || 0,
                },
                daily: {
                    promptCount: daily?.count || 0,
                }
            },
            history: history || [],
        })
    } catch (error: any) {
        console.error('API Error:', error); return NextResponse.json({ error: 'Bir hata olu�tu. L�tfen tekrar deneyin.' }, { status: 500 })
    }
}
