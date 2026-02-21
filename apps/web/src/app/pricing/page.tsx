'use client'

import { useState } from 'react'
import ShaderBackground from '@/components/ui/shader-background'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
import { Check, X, ArrowLeft, Sparkles, Zap, Crown, Code2, Building2, Star, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getNormalPlans, getDeveloperPlans, getPlanPrice, COMPARISON_FEATURES, MODEL_LABELS, MODEL_LABELS_EN, type PlanConfig, type BillingCycle, type PlanType } from '@/lib/plans'


const planIcons: Record<string, any> = {
    free: Zap, starter: Star, pro: Crown, unlimited: Sparkles,
    dev_starter: Code2, dev_pro: Code2, enterprise: Building2,
}

const planGlow: Record<string, string> = {
    free: '',
    starter: 'hover:shadow-emerald-500/10',
    pro: 'hover:shadow-purple-500/15',
    unlimited: 'hover:shadow-purple-500/10',
    dev_starter: 'hover:shadow-cyan-500/10',
    dev_pro: 'hover:shadow-cyan-500/15',
    enterprise: 'hover:shadow-amber-500/10',
}

const planBorder: Record<string, string> = {
    free: 'border-neutral-700/30',
    starter: 'border-emerald-500/20',
    pro: 'border-purple-500/30',
    unlimited: 'border-purple-500/20',
    dev_starter: 'border-cyan-500/20',
    dev_pro: 'border-cyan-500/30',
    enterprise: 'border-amber-500/20',
}

function formatLimit(val: number): string {
    if (val === -1) return '∞'
    if (val === 0) return '—'
    if (val >= 1000) return `${(val / 1000)}K`
    return val.toString()
}

function PlanCard({ plan, cycle, highlight, locale, onUpgrade, loading }: {
    plan: PlanConfig;
    cycle: BillingCycle;
    highlight?: boolean;
    locale: 'tr' | 'en';
    onUpgrade: (planId: PlanType) => void;
    loading?: boolean;
}) {
    const { t } = useLanguage()
    const Icon = planIcons[plan.id] || Zap
    const price = getPlanPrice(plan, cycle)
    const isEnterprise = plan.id === 'enterprise'
    const isTR = locale === 'tr'
    const planName = isTR ? plan.nameTr : plan.name
    const features = isTR ? plan.features : plan.featuresEn

    return (
        <div className={cn(
            'relative flex flex-col p-6 rounded-2xl border bg-black/40 backdrop-blur-sm transition-all hover:scale-[1.02] duration-300 shadow-xl',
            highlight ? `border-2 ${planBorder[plan.id]} ${planGlow[plan.id]}` : `${planBorder[plan.id]} ${planGlow[plan.id]}`,
        )}>
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-[10px] font-bold uppercase rounded-full tracking-wider whitespace-nowrap shadow-lg shadow-purple-500/20">
                    {t.pricing.mostPopular}
                </div>
            )}
            <div className="flex items-center gap-2 mb-4">
                <div className={cn('p-1.5 rounded-lg', plan.popular ? 'bg-purple-500/10' : 'bg-white/5')}>
                    <Icon className={cn('w-4 h-4', plan.popular ? 'text-purple-400' : 'text-neutral-400')} />
                </div>
                <h3 className="text-lg font-semibold text-white">{planName}</h3>
            </div>

            {isEnterprise ? (
                <div className="mb-6">
                    <span className="text-2xl font-bold text-white">{t.pricing.customPrice}</span>
                    <p className="text-xs text-neutral-500 mt-1">{t.pricing.customPriceDesc}</p>
                </div>
            ) : (
                <div className="mb-6">
                    <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-300">₺{price}</span>
                    <span className="text-neutral-500 text-sm">{t.pricing.perMonth}</span>
                    {cycle === 'yearly' && plan.yearlyPrice && (
                        <p className="text-xs text-neutral-500 mt-1">
                            {isTR ? (
                                <>Toplam ₺{plan.yearlyPrice.toLocaleString('tr-TR')}/yıl ·{' '}
                                    <span className="text-emerald-400">%{plan.discount} tasarruf</span></>
                            ) : (
                                <>Total ₺{plan.yearlyPrice.toLocaleString('en-US')}/year ·{' '}
                                    <span className="text-emerald-400">{plan.discount}% savings</span></>
                            )}
                        </p>
                    )}
                </div>
            )}

            <ul className="space-y-2 mb-6 flex-1">
                {features.slice(0, 6).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                    </li>
                ))}
                {features.length > 6 && (
                    <li className="text-[10px] text-neutral-600">{t.pricing.moreFeatures(features.length - 6)}</li>
                )}
            </ul>

            <button
                disabled={loading || plan.id === 'free'}
                onClick={() => !isEnterprise && plan.id !== 'free' && onUpgrade(plan.id)}
                className={cn(
                    'group relative w-full py-3 rounded-xl font-medium transition-all text-sm overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed',
                    plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]'
                        : isEnterprise
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                )}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                            {plan.id === 'free' ? t.pricing.startFree :
                                isEnterprise ? t.pricing.contactUs :
                                    plan.popular ? t.pricing.tryFree :
                                        t.pricing.startAt(price)}
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </span>
            </button>
        </div>
    )
}

export default function PricingPage() {
    const [cycle, setCycle] = useState<BillingCycle>('monthly')
    const [tab, setTab] = useState<'normal' | 'developer'>('normal')
    const { t, locale } = useLanguage()
    const isTR = locale === 'tr'

    const normalPlans = getNormalPlans()
    const devPlans = getDeveloperPlans()
    const allPlans = [...normalPlans, ...devPlans]
    const modelLabels = isTR ? MODEL_LABELS : MODEL_LABELS_EN

    const handleUpgrade = async (planId: PlanType) => {
        // Payment functionality disabled as per request
        // Using alert for simplicity, could be replaced with a toast
        alert("Payments are currently disabled.");
    }

    return (
        <div className="min-h-screen relative w-full bg-transparent flex flex-col overflow-hidden text-neutral-200">
            <ShaderBackground />

            {/* Nav */}
            <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-sm bg-black/20">
                <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> {t.pricing.goBack}
                </Link>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-400 to-indigo-300">
                    AI Prompt App
                </h1>
                <ThemeToggle />
            </header>

            <main className="relative z-20 flex-1 flex flex-col items-center px-4 py-14">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
                        <Crown className="w-3.5 h-3.5" /> {t.pricing.badge}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-fuchsia-300 to-indigo-400 mb-4">
                        {t.pricing.title}
                    </h2>
                    <p className="text-neutral-500 max-w-lg mx-auto text-sm">
                        {t.pricing.subtitle}
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center gap-1 mb-10 bg-neutral-900/50 border border-neutral-800 rounded-full p-1">
                    <button onClick={() => setCycle('monthly')}
                        className={cn('px-5 py-2 rounded-full text-sm font-medium transition-all',
                            cycle === 'monthly' ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-300 border border-purple-500/20' : 'text-neutral-500 hover:text-neutral-300')}>
                        {t.pricing.monthly}
                    </button>
                    <button onClick={() => setCycle('yearly')}
                        className={cn('px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                            cycle === 'yearly' ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-300 border border-purple-500/20' : 'text-neutral-500 hover:text-neutral-300')}>
                        {t.pricing.yearly}
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                            {t.pricing.yearlySave}
                        </span>
                    </button>
                </div>

                {/* Plan Type Tabs */}
                <div className="flex items-center gap-2 mb-8">
                    <button onClick={() => setTab('normal')}
                        className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-all border',
                            tab === 'normal' ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-transparent border-neutral-800 text-neutral-500 hover:text-white')}>
                        {t.pricing.normalUser}
                    </button>
                    <button onClick={() => setTab('developer')}
                        className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-all border',
                            tab === 'developer' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' : 'bg-transparent border-neutral-800 text-neutral-500 hover:text-white')}>
                        {t.pricing.developer}
                    </button>
                </div>

                {/* Plan Cards */}
                <div className={cn(
                    'grid gap-5 w-full max-w-5xl mb-16',
                    tab === 'normal' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'
                )}>
                    {(tab === 'normal' ? normalPlans : devPlans).map(plan => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            cycle={cycle}
                            highlight={plan.popular || plan.id === 'dev_pro'}
                            locale={locale}
                            onUpgrade={handleUpgrade}
                        />
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="w-full max-w-6xl">
                    <h3 className="text-lg font-semibold text-white mb-6 text-center">{t.pricing.comparison}</h3>
                    <div className="bg-black/40 backdrop-blur-sm border border-neutral-700/30 rounded-2xl overflow-x-auto">
                        <div className="grid gap-4 px-4 py-3 border-b border-neutral-800/50 bg-neutral-900/30 min-w-[700px]"
                            style={{ gridTemplateColumns: `200px repeat(${allPlans.length}, 1fr)` }}>
                            <span className="text-xs text-neutral-400 font-medium">{t.pricing.feature}</span>
                            {allPlans.map(p => (
                                <span key={p.id} className={cn('text-xs text-center font-medium', p.popular ? 'text-purple-400' : 'text-neutral-400')}>
                                    {isTR ? p.nameTr : p.name} {p.popular ? '⭐' : ''}
                                </span>
                            ))}
                        </div>
                        {COMPARISON_FEATURES.map((feat, i) => (
                            <div key={i}
                                className={cn('grid gap-4 px-4 py-2.5 items-center min-w-[700px]',
                                    i < COMPARISON_FEATURES.length - 1 && 'border-b border-neutral-800/20')}
                                style={{ gridTemplateColumns: `200px repeat(${allPlans.length}, 1fr)` }}>
                                <span className="text-xs text-neutral-300">{isTR ? feat.name : feat.nameEn}</span>
                                {allPlans.map(plan => {
                                    const val = (plan as any)[feat.key]
                                    return (
                                        <div key={plan.id} className="text-center">
                                            {feat.format === 'boolean' ? (
                                                val ? <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" /> : <X className="w-3.5 h-3.5 text-red-400/40 mx-auto" />
                                            ) : feat.format === 'inverse_boolean' ? (
                                                !val ? <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" /> : <X className="w-3.5 h-3.5 text-red-400/40 mx-auto" />
                                            ) : feat.format === 'limit' ? (
                                                <span className="text-[11px] text-neutral-400">{formatLimit(val)}</span>
                                            ) : feat.format === 'model' ? (
                                                <span className="text-[11px] text-neutral-400">{modelLabels[val] || val}</span>
                                            ) : (
                                                <span className="text-[11px] text-neutral-400">{val}</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust */}
                <div className="mt-14 text-center space-y-2">
                    <p className="text-xs text-neutral-600">{t.pricing.trustLine1}</p>
                    <p className="text-xs text-neutral-700">{t.pricing.trustLine2}</p>
                </div>
            </main>
        </div>
    )
}
