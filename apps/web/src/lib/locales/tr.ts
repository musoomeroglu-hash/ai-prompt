export interface Dictionary {
    // Common
    upgrade: string
    account: string
    history: string
    bypass: string
    logout: string
    trialDays: (n: number) => string

    // Home Hero
    heroTitle: string
    heroSubtitle: string
    generating: string

    // History Sidebar
    recentHistory: string
    noHistory: string

    // Chat Input
    placeholder: (ai: string) => string
    selectTargetAI: string
    categories: Record<string, string>

    // Results Panel
    tabs: Record<string, string>
    variants: string
    words: string
    copyAll: string
    copiedAll: string
    copy: string
    copied: string
    exportLabel: string
    regenerate: string
    showMore: string
    showLess: string
    tldr: string

    // Pricing Page
    pricing: {
        badge: string
        title: string
        subtitle: string
        goBack: string
        monthly: string
        yearly: string
        yearlySave: string
        normalUser: string
        developer: string
        mostPopular: string
        customPrice: string
        customPriceDesc: string
        perMonth: string
        totalYear: (price: string, discount: number) => string
        moreFeatures: (n: number) => string
        startFree: string
        contactUs: string
        tryFree: string
        startAt: (price: number) => string
        comparison: string
        feature: string
        trustLine1: string
        trustLine2: string
    }

    // Plan Names
    planNames: Record<string, string>
}

const tr: Dictionary = {
    upgrade: 'Yükselt',
    account: 'Hesap',
    history: 'Geçmiş',
    bypass: 'Bypass',
    logout: 'Çıkış',
    trialDays: (n) => `Deneme: ${n} gün`,

    heroTitle: 'Neye ihtiyacın var?',
    heroSubtitle: 'Hedef AI\'nı seç, fikrini anlat ve optimize edilmiş promptlar al',
    generating: 'Promptlarınız oluşturuluyor...',

    recentHistory: 'Son Geçmiş',
    noHistory: 'Henüz geçmiş yok',

    placeholder: (ai) => `Ne için prompt istediğinizi açıklayın (${ai} için optimize)...`,
    selectTargetAI: 'Hedef AI Seçin',
    categories: {
        marketing: 'Pazarlama',
        coding: 'Kodlama',
        content: 'Yaratıcı Yazım',
        academic: 'Akademik',
        prompt_improve: 'Prompt İyileştir',
    },

    tabs: {
        short: 'Hızlı',
        detailed: 'Detaylı',
        creative: 'Yaratıcı',
        professional: 'Profesyonel',
        technical: 'Teknik',
    },
    variants: 'varyant',
    words: 'kelime',
    copyAll: 'Tümünü Kopyala',
    copiedAll: 'Tümü Kopyalandı!',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
    exportLabel: 'Dışa Aktar',
    regenerate: 'Yeniden Oluştur',
    showMore: 'Devamını Göster',
    showLess: 'Kısalt',
    tldr: 'ÖZET',

    // ─── Pricing Page ───
    pricing: {
        badge: 'Fiyatlandırma',
        title: 'İhtiyacınıza Uygun Plan',
        subtitle: '7 günlük ücretsiz deneme ile başlayın. İstediğiniz zaman yükseltin veya iptal edin.',
        goBack: 'Geri Dön',
        monthly: 'Aylık',
        yearly: 'Yıllık',
        yearlySave: '%17 Tasarruf',
        normalUser: '👤 Normal Kullanıcı',
        developer: '💻 Geliştirici (API)',
        mostPopular: 'En Popüler',
        customPrice: 'Özel Fiyat',
        customPriceDesc: 'İhtiyacınıza göre teklif',
        perMonth: '/ay',
        totalYear: (price: string, discount: number) => `Toplam ₺${price}/yıl · %${discount} tasarruf`,
        moreFeatures: (n: number) => `+${n} daha fazla`,
        startFree: 'Ücretsiz Başla',
        contactUs: 'Bize Ulaşın',
        tryFree: '7 Gün Ücretsiz Dene',
        startAt: (price: number) => `₺${price}/ay Başla`,
        comparison: 'Özellik Karşılaştırması',
        feature: 'Özellik',
        trustLine1: '7 günlük ücretsiz deneme · İstediğin zaman iptal · 30 gün para iade garantisi',
        trustLine2: 'Güvenli ödeme · SSL şifreleme · KVKK uyumlu',
    },

    planNames: {
        free: 'Ücretsiz',
        starter: 'Başlangıç',
        pro: 'Pro',
        unlimited: 'Sınırsız',
        dev_starter: 'Dev Starter',
        dev_pro: 'Dev Pro',
        enterprise: 'Enterprise',
    },
}

export default tr
