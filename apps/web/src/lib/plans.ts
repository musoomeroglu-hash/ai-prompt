// Plan definitions for all 7 subscription tiers
export type PlanType = 'free' | 'starter' | 'pro' | 'unlimited' | 'dev_starter' | 'dev_pro' | 'enterprise'
export type BillingCycle = 'monthly' | 'yearly'
export type UserType = 'normal' | 'developer'

export interface PlanConfig {
    id: PlanType
    name: string
    nameTr: string
    userType: UserType
    monthlyPrice: number       // TRY
    yearlyPrice: number | null // TRY (total per year)
    yearlyMonthly: number | null // TRY per month on yearly
    discount: number           // percent saved on yearly
    popular?: boolean

    // Limits
    monthlyPromptLimit: number // 0 = none, -1 = unlimited
    dailyPromptLimit: number   // 0 = none, -1 = unlimited
    apiCallsPerMonth: number   // 0 = none, -1 = unlimited
    aiAnalysisPerMonth: number
    abTestPerMonth: number
    customTemplates: number
    teamMembers: number
    historyLimit: number       // -1 = unlimited

    // Features
    features: string[]
    featuresEn: string[]
    aiModelTier: 'basic' | 'advanced' | 'premium' | 'custom'
    hasExtension: boolean
    extensionTier: 'basic' | 'full' | 'pro' | 'unlimited'
    hasAds: boolean
    hasWatermark: boolean
    hasExport: boolean
    hasWhiteLabel: boolean
    supportTier: string
}

export const PLANS: Record<PlanType, PlanConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        nameTr: 'Ücretsiz',
        userType: 'normal',
        monthlyPrice: 0,
        yearlyPrice: null,
        yearlyMonthly: null,
        discount: 0,

        monthlyPromptLimit: 5,
        dailyPromptLimit: 2,
        apiCallsPerMonth: 0,
        aiAnalysisPerMonth: 0,
        abTestPerMonth: 0,
        customTemplates: 0,
        teamMembers: 1,
        historyLimit: 10,

        features: [
            'Aylık 5 prompt üretimi',
            'Temel kategoriler (10)',
            'Topluluk kütüphanesi (görüntüleme)',
            'Email destek (48 saat)',
            'Chrome Extension (temel)',
        ],
        featuresEn: [
            '5 prompts per month',
            'Basic categories (10)',
            'Community library (view only)',
            'Email support (48h)',
            'Chrome Extension (basic)',
        ],
        aiModelTier: 'basic',
        hasExtension: true,
        extensionTier: 'basic',
        hasAds: true,
        hasWatermark: true,
        hasExport: false,
        hasWhiteLabel: false,
        supportTier: 'Email 48h',
    },

    starter: {
        id: 'starter',
        name: 'Starter',
        nameTr: 'Başlangıç',
        userType: 'normal',
        monthlyPrice: 149,
        yearlyPrice: 1490,
        yearlyMonthly: 124,
        discount: 17,

        monthlyPromptLimit: 50,
        dailyPromptLimit: 5,
        apiCallsPerMonth: 0,
        aiAnalysisPerMonth: 5,
        abTestPerMonth: 0,
        customTemplates: 5,
        teamMembers: 1,
        historyLimit: -1,

        features: [
            'Aylık 50 prompt üretimi',
            'Tüm kategoriler (50+)',
            'Sınırsız prompt geçmişi',
            'Chrome Extension (tam)',
            'Email destek (24 saat)',
            'Reklamsız deneyim',
            'Temel prompt şablonları',
            'Prompt favorileme',
        ],
        featuresEn: [
            '50 prompts per month',
            'All categories (50+)',
            'Unlimited prompt history',
            'Chrome Extension (full)',
            'Email support (24h)',
            'Ad-free experience',
            'Basic prompt templates',
            'Prompt bookmarking',
        ],
        aiModelTier: 'basic',
        hasExtension: true,
        extensionTier: 'full',
        hasAds: false,
        hasWatermark: false,
        hasExport: false,
        hasWhiteLabel: false,
        supportTier: 'Email 24h',
    },

    pro: {
        id: 'pro',
        name: 'Pro',
        nameTr: 'Profesyonel',
        userType: 'normal',
        monthlyPrice: 299,
        yearlyPrice: 2990,
        yearlyMonthly: 249,
        discount: 17,
        popular: true,

        monthlyPromptLimit: 200,
        dailyPromptLimit: -1,
        apiCallsPerMonth: 3000,
        aiAnalysisPerMonth: -1,
        abTestPerMonth: -1,
        customTemplates: 20,
        teamMembers: 2,
        historyLimit: -1,

        features: [
            'Aylık 200 prompt üretimi',
            'Gelişmiş AI modeli',
            'Tüm + Premium kategoriler',
            'AI prompt analizi',
            'A/B test özelliği',
            'API erişimi (3K/ay)',
            'Toplu prompt üretimi',
            'Export (PDF, DOCX, JSON)',
            'WhatsApp destek (12 saat)',
            'Takım: 2 kullanıcı',
            'Çoklu dil desteği (10 dil)',
        ],
        featuresEn: [
            '200 prompts per month',
            'Advanced AI model',
            'All + Premium categories',
            'AI prompt analysis',
            'A/B testing',
            'API access (3K/mo)',
            'Batch prompt generation',
            'Export (PDF, DOCX, JSON)',
            'WhatsApp support (12h)',
            'Team: 2 members',
            'Multilingual support (10 languages)',
        ],
        aiModelTier: 'advanced',
        hasExtension: true,
        extensionTier: 'pro',
        hasAds: false,
        hasWatermark: false,
        hasExport: true,
        hasWhiteLabel: false,
        supportTier: 'WhatsApp 12h',
    },

    unlimited: {
        id: 'unlimited',
        name: 'Unlimited',
        nameTr: 'Sınırsız',
        userType: 'normal',
        monthlyPrice: 499,
        yearlyPrice: 4990,
        yearlyMonthly: 416,
        discount: 17,

        monthlyPromptLimit: -1,
        dailyPromptLimit: -1,
        apiCallsPerMonth: 150000,
        aiAnalysisPerMonth: -1,
        abTestPerMonth: -1,
        customTemplates: -1,
        teamMembers: 5,
        historyLimit: -1,

        features: [
            'Sınırsız prompt üretimi',
            'En gelişmiş AI modeli',
            'Tüm özellikler dahil',
            'Sınırsız AI analizi & A/B test',
            'API erişimi (150K/ay)',
            'Webhook + Zapier',
            'White-label opsiyonu',
            'Özel domain desteği',
            'Dedicated account manager',
            'Beta özelliklere erken erişim',
            'SLA: %99.5 uptime',
            'Takım: 5 kullanıcı',
        ],
        featuresEn: [
            'Unlimited prompt generation',
            'Most advanced AI model',
            'All features included',
            'Unlimited AI analysis & A/B testing',
            'API access (150K/mo)',
            'Webhook + Zapier',
            'White-label option',
            'Custom domain support',
            'Dedicated account manager',
            'Early access to beta features',
            'SLA: 99.5% uptime',
            'Team: 5 members',
        ],
        aiModelTier: 'premium',
        hasExtension: true,
        extensionTier: 'unlimited',
        hasAds: false,
        hasWatermark: false,
        hasExport: true,
        hasWhiteLabel: true,
        supportTier: 'Dedicated',
    },

    dev_starter: {
        id: 'dev_starter',
        name: 'Developer Starter',
        nameTr: 'Geliştirici Başlangıç',
        userType: 'developer',
        monthlyPrice: 599,
        yearlyPrice: null,
        yearlyMonthly: null,
        discount: 0,

        monthlyPromptLimit: 0,
        dailyPromptLimit: 0,
        apiCallsPerMonth: 10000,
        aiAnalysisPerMonth: -1,
        abTestPerMonth: -1,
        customTemplates: 0,
        teamMembers: 2,
        historyLimit: -1,

        features: [
            '10,000 API call/ay',
            'Rate limit: 100 req/dk',
            'REST API erişimi',
            '3 API key',
            'Webhook desteği',
            'API dokümantasyonu',
            'Postman collection',
            'Sandbox ortamı',
            'Email destek (24h)',
        ],
        featuresEn: [
            '10,000 API calls/mo',
            'Rate limit: 100 req/min',
            'REST API access',
            '3 API keys',
            'Webhook support',
            'API documentation',
            'Postman collection',
            'Sandbox environment',
            'Email support (24h)',
        ],
        aiModelTier: 'advanced',
        hasExtension: true,
        extensionTier: 'pro',
        hasAds: false,
        hasWatermark: false,
        hasExport: true,
        hasWhiteLabel: false,
        supportTier: 'Email 24h',
    },

    dev_pro: {
        id: 'dev_pro',
        name: 'Developer Pro',
        nameTr: 'Geliştirici Profesyonel',
        userType: 'developer',
        monthlyPrice: 1499,
        yearlyPrice: null,
        yearlyMonthly: null,
        discount: 0,

        monthlyPromptLimit: 0,
        dailyPromptLimit: 0,
        apiCallsPerMonth: 50000,
        aiAnalysisPerMonth: -1,
        abTestPerMonth: -1,
        customTemplates: 0,
        teamMembers: 5,
        historyLimit: -1,

        features: [
            '50,000 API call/ay',
            'Rate limit: 500 req/dk',
            'REST API + GraphQL',
            '10 API key',
            'Gelişmiş webhook (retry)',
            'SDK (Node.js, Python)',
            'Custom domain endpoint',
            'Slack/Discord destek',
            'Real-time monitoring',
            'SLA: %99.5 uptime',
        ],
        featuresEn: [
            '50,000 API calls/mo',
            'Rate limit: 500 req/min',
            'REST API + GraphQL',
            '10 API keys',
            'Advanced webhook (retry)',
            'SDK (Node.js, Python)',
            'Custom domain endpoint',
            'Slack/Discord support',
            'Real-time monitoring',
            'SLA: 99.5% uptime',
        ],
        aiModelTier: 'premium',
        hasExtension: true,
        extensionTier: 'unlimited',
        hasAds: false,
        hasWatermark: false,
        hasExport: true,
        hasWhiteLabel: false,
        supportTier: 'Slack',
    },

    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        nameTr: 'Kurumsal',
        userType: 'developer',
        monthlyPrice: 5000,
        yearlyPrice: null,
        yearlyMonthly: null,
        discount: 0,

        monthlyPromptLimit: -1,
        dailyPromptLimit: -1,
        apiCallsPerMonth: -1,
        aiAnalysisPerMonth: -1,
        abTestPerMonth: -1,
        customTemplates: -1,
        teamMembers: -1,
        historyLimit: -1,

        features: [
            'Sınırsız API calls',
            'Dedicated server/cluster',
            'White-label API',
            'Custom SLA (%99.9)',
            'Dedicated account manager',
            'On-premise opsiyonu',
            'SSO entegrasyonu',
            'KVKK/GDPR uyumluluk',
            'Custom billing',
            '24/7 telefon destek',
        ],
        featuresEn: [
            'Unlimited API calls',
            'Dedicated server/cluster',
            'White-label API',
            'Custom SLA (99.9%)',
            'Dedicated account manager',
            'On-premise option',
            'SSO integration',
            'GDPR/KVKK compliant',
            'Custom billing',
            '24/7 phone support',
        ],
        aiModelTier: 'custom',
        hasExtension: true,
        extensionTier: 'unlimited',
        hasAds: false,
        hasWatermark: false,
        hasExport: true,
        hasWhiteLabel: true,
        supportTier: '24/7',
    },
}

// Helper: Get plans by user type
export function getNormalPlans(): PlanConfig[] {
    return Object.values(PLANS).filter(p => p.userType === 'normal')
}

export function getDeveloperPlans(): PlanConfig[] {
    return Object.values(PLANS).filter(p => p.userType === 'developer')
}

// Helper: Get price for billing cycle
export function getPlanPrice(plan: PlanConfig, cycle: BillingCycle): number {
    if (cycle === 'yearly' && plan.yearlyMonthly) return plan.yearlyMonthly
    return plan.monthlyPrice
}

// Helper: Check if feature is available for plan
export function isPlanAtLeast(current: PlanType, required: PlanType): boolean {
    const order: PlanType[] = ['free', 'starter', 'pro', 'unlimited']
    const devOrder: PlanType[] = ['dev_starter', 'dev_pro', 'enterprise']
    const normalIdx = order.indexOf(current)
    const requiredIdx = order.indexOf(required)
    if (normalIdx >= 0 && requiredIdx >= 0) return normalIdx >= requiredIdx
    const devIdx = devOrder.indexOf(current)
    const devReqIdx = devOrder.indexOf(required)
    if (devIdx >= 0 && devReqIdx >= 0) return devIdx >= devReqIdx
    return false
}

// Comparison table features
export const COMPARISON_FEATURES = [
    { name: 'Aylık Prompt Limiti', nameEn: 'Monthly Prompt Limit', key: 'monthlyPromptLimit' as const, format: 'limit' },
    { name: 'API Calls/ay', nameEn: 'API Calls/mo', key: 'apiCallsPerMonth' as const, format: 'limit' },
    { name: 'AI Model', nameEn: 'AI Model', key: 'aiModelTier' as const, format: 'model' },
    { name: 'Prompt Geçmişi', nameEn: 'Prompt History', key: 'historyLimit' as const, format: 'limit' },
    { name: 'AI Analiz', nameEn: 'AI Analysis', key: 'aiAnalysisPerMonth' as const, format: 'limit' },
    { name: 'A/B Test', nameEn: 'A/B Test', key: 'abTestPerMonth' as const, format: 'limit' },
    { name: 'Özel Şablon', nameEn: 'Custom Templates', key: 'customTemplates' as const, format: 'limit' },
    { name: 'Chrome Extension', nameEn: 'Chrome Extension', key: 'extensionTier' as const, format: 'text' },
    { name: 'Destek', nameEn: 'Support', key: 'supportTier' as const, format: 'text' },
    { name: 'Takım Üyesi', nameEn: 'Team Members', key: 'teamMembers' as const, format: 'limit' },
    { name: 'White-label', nameEn: 'White-label', key: 'hasWhiteLabel' as const, format: 'boolean' },
    { name: 'Export', nameEn: 'Export', key: 'hasExport' as const, format: 'boolean' },
    { name: 'Reklamsız', nameEn: 'Ad-free', key: 'hasAds' as const, format: 'inverse_boolean' },
]

export const MODEL_LABELS: Record<string, string> = {
    basic: 'Temel',
    advanced: 'Gelişmiş',
    premium: 'Gelişmiş+',
    custom: 'Özel',
}

export const MODEL_LABELS_EN: Record<string, string> = {
    basic: 'Basic',
    advanced: 'Advanced',
    premium: 'Advanced+',
    custom: 'Custom',
}
