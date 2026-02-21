import type { Dictionary } from './tr'

const en: Dictionary = {
    // ─── Common ───
    upgrade: 'Upgrade',
    account: 'Account',
    history: 'History',
    bypass: 'Bypass',
    logout: 'Logout',
    trialDays: (n: number) => `Trial: ${n} days`,

    // ─── Home Hero ───
    heroTitle: 'What do you need?',
    heroSubtitle: 'Select your target AI, describe your idea, and get optimized prompts',
    generating: 'Generating your prompts...',

    // ─── History Sidebar ───
    recentHistory: 'Recent History',
    noHistory: 'No history yet',

    // ─── Chat Input ───
    placeholder: (ai: string) => `Describe what you need a prompt for (optimized for ${ai})...`,
    selectTargetAI: 'Select Target AI',
    categories: {
        marketing: 'Marketing',
        coding: 'Coding',
        content: 'Creative Writing',
        academic: 'Academic',
        prompt_improve: 'Improve Prompt',
    },

    // ─── Results Panel ───
    tabs: {
        short: 'Quick',
        detailed: 'Detailed',
        creative: 'Creative',
        professional: 'Professional',
        technical: 'Technical',
    },
    variants: 'variants',
    words: 'words',
    copyAll: 'Copy All',
    copiedAll: 'Copied All!',
    copy: 'Copy',
    copied: 'Copied!',
    exportLabel: 'Export',
    regenerate: 'Regenerate',
    showMore: 'Show More',
    showLess: 'Show Less',
    tldr: 'TL;DR',

    // ─── Pricing Page ───
    pricing: {
        badge: 'Pricing',
        title: 'The Right Plan for You',
        subtitle: 'Start with a 7-day free trial. Upgrade or cancel anytime.',
        goBack: 'Go Back',
        monthly: 'Monthly',
        yearly: 'Yearly',
        yearlySave: 'Save 17%',
        normalUser: '👤 Regular User',
        developer: '💻 Developer (API)',
        mostPopular: 'Most Popular',
        customPrice: 'Custom Price',
        customPriceDesc: 'Tailored to your needs',
        perMonth: '/mo',
        totalYear: (price: string, discount: number) => `Total ₺${price}/year · ${discount}% savings`,
        moreFeatures: (n: number) => `+${n} more`,
        startFree: 'Start Free',
        contactUs: 'Contact Us',
        tryFree: '7-Day Free Trial',
        startAt: (price: number) => `₺${price}/mo Start`,
        comparison: 'Feature Comparison',
        feature: 'Feature',
        trustLine1: '7-day free trial · Cancel anytime · 30-day money-back guarantee',
        trustLine2: 'Secure payment · SSL encryption · GDPR compliant',
    },

    // ─── Plan Names ───
    planNames: {
        free: 'Free',
        starter: 'Starter',
        pro: 'Pro',
        unlimited: 'Unlimited',
        dev_starter: 'Dev Starter',
        dev_pro: 'Dev Pro',
        enterprise: 'Enterprise',
    },
}

export default en
