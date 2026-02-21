'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import ShaderBackground from '@/components/ui/shader-background'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Loader from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import { ArrowLeft, Crown, Zap, Star, Sparkles, BarChart3, CreditCard, Clock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const planLabels: Record<string, { name: string; icon: any; color: string }> = {
    free: { name: 'Ücretsiz', icon: Zap, color: 'text-neutral-400' },
    starter: { name: 'Başlangıç', icon: Star, color: 'text-emerald-400' },
    pro: { name: 'Profesyonel', icon: Crown, color: 'text-purple-400' },
    unlimited: { name: 'Sınırsız', icon: Sparkles, color: 'text-purple-400' },
    dev_starter: { name: 'Dev Starter', icon: Zap, color: 'text-cyan-400' },
    dev_pro: { name: 'Dev Pro', icon: Crown, color: 'text-cyan-400' },
    enterprise: { name: 'Enterprise', icon: Crown, color: 'text-amber-400' },
}

export default function AccountPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [sub, setSub] = useState<any>(null)
    const [usage, setUsage] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/'); return }

        const subRes = await fetch('/api/subscription')
        const subData = await subRes.json()
        setSub(subData.subscription)

        const usageRes = await fetch('/api/usage')
        const usageData = await usageRes.json()
        setUsage(usageData)

        const { data: paymentData } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
        setPayments(paymentData || [])
        setLoading(false)
    }

    const handleCancel = async () => {
        if (!confirm('Aboneliğinizi iptal etmek istediğinize emin misiniz?')) return
        await fetch('/api/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'cancel', planType: sub?.plan })
        })
        loadData()
    }

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            <ShaderBackground opacity={0.4} />
            <div className="relative z-10">
                <Loader size="lg" />
            </div>
        </div>
    )

    const planInfo = planLabels[sub?.plan || 'free']
    const PlanIcon = planInfo.icon

    return (
        <div className="min-h-screen relative w-full bg-transparent flex flex-col overflow-hidden text-neutral-200">
            <ShaderBackground />

            <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-sm bg-black/20">
                <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Geri Dön
                </Link>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-400 to-indigo-300">
                    Hesap Yönetimi
                </h1>
                <ThemeToggle />
            </header>

            <main className="relative z-20 flex-1 px-4 py-10 max-w-4xl mx-auto w-full space-y-6">
                {/* Current Plan */}
                <div className="bg-black/40 backdrop-blur-sm border border-neutral-700/30 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                        <User className="w-4 h-4" /> Mevcut Plan
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className={cn('p-3 rounded-xl bg-white/5 border border-white/10', planInfo.color)}>
                                <PlanIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{planInfo.name}</h3>
                                <p className="text-xs text-neutral-500">
                                    {sub?.isTrialActive && `Trial: ${sub.trialDaysRemaining} gün kaldı`}
                                    {sub?.isSubscriptionActive && sub?.subscriptionEnd && `Sonraki ödeme: ${new Date(sub.subscriptionEnd).toLocaleDateString('tr-TR')}`}
                                    {sub?.status === 'expired' && 'Süresi dolmuş'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/pricing"
                                className="group flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 text-purple-400 hover:from-purple-500/20 hover:to-fuchsia-500/20 transition-all">
                                Plan Değiştir <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            {sub?.isSubscriptionActive && (
                                <button onClick={handleCancel}
                                    className="px-4 py-2 text-xs font-medium rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                    İptal Et
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-black/40 backdrop-blur-sm border border-neutral-700/30 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                        <BarChart3 className="w-4 h-4" /> Kullanım İstatistikleri
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-neutral-400">Aylık Prompt</span>
                                <span className="text-xs text-neutral-500">
                                    {sub?.monthlyPromptsUsed || 0} / {sub?.monthlyPromptLimit === -1 ? '∞' : sub?.monthlyPromptLimit || 5}
                                </span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-2">
                                <div className={cn('h-2 rounded-full transition-all',
                                    (sub?.monthlyUsagePercent || 0) >= 90 ? 'bg-red-500' :
                                        (sub?.monthlyUsagePercent || 0) >= 80 ? 'bg-amber-500' : 'bg-purple-500'
                                )} style={{ width: `${Math.min(100, sub?.monthlyUsagePercent || 0)}%` }} />
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-neutral-400">Günlük Prompt</span>
                                <span className="text-xs text-neutral-500">
                                    {sub?.dailyPromptsUsed || 0} / {sub?.dailyPromptLimit === -1 ? '∞' : sub?.dailyPromptLimit || 2}
                                </span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-2">
                                <div className="h-2 rounded-full bg-cyan-500 transition-all"
                                    style={{ width: `${sub?.dailyPromptLimit > 0 ? Math.min(100, ((sub?.dailyPromptsUsed || 0) / sub.dailyPromptLimit) * 100) : 0}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-black/40 backdrop-blur-sm border border-neutral-700/30 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                        <CreditCard className="w-4 h-4" /> Fatura Geçmişi
                    </div>
                    {payments.length > 0 ? (
                        <div className="space-y-2">
                            {payments.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn('w-2 h-2 rounded-full',
                                            p.status === 'succeeded' ? 'bg-emerald-500' : p.status === 'failed' ? 'bg-red-500' : 'bg-amber-500')} />
                                        <div>
                                            <span className="text-xs text-white font-medium">₺{p.amount}</span>
                                            <span className="text-[10px] text-neutral-500 ml-2">{new Date(p.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full',
                                        p.status === 'succeeded' ? 'bg-emerald-500/20 text-emerald-400' :
                                            p.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400')}>
                                        {p.status === 'succeeded' ? 'Başarılı' : p.status === 'failed' ? 'Başarısız' : 'İade'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-neutral-600 text-xs">
                            <Clock className="w-6 h-6 mb-2 opacity-30" />
                            Henüz fatura yok
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
