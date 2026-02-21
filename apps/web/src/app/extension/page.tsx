'use client'

import { useState } from 'react'
import Link from 'next/link'
import ShaderBackground from '@/components/ui/shader-background'
import { ArrowLeft, Download, Chrome, CheckCircle2, Shield, Zap, Globe, Puzzle, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ExtensionPage() {
    const [downloading, setDownloading] = useState(false)
    const [downloaded, setDownloaded] = useState(false)

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await fetch('/api/extension/download')
            if (!response.ok) throw new Error('Download failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'antigravity-extension-v2.0.0.zip'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            setDownloaded(true)
        } catch (error) {
            console.error('Download error:', error)
            alert('İndirme başarısız oldu. Lütfen tekrar deneyin.')
        } finally {
            setDownloading(false)
        }
    }

    const features = [
        {
            icon: <Zap className="w-5 h-5" />,
            title: 'Sidebar + Inline Aksiyonlar',
            description: 'Metin seç → ✦ ikonuna tıkla → Sidebar\'da anında prompt üret. Sağ tık menüsünden de erişilebilir',
        },
        {
            icon: <Globe className="w-5 h-5" />,
            title: '10+ AI Platform Desteği',
            description: 'ChatGPT, Claude, Gemini, Copilot ve daha fazlasına özel promptlar',
        },
        {
            icon: <Puzzle className="w-5 h-5" />,
            title: '5 Prompt Varyasyonu',
            description: 'Kısa, Detaylı, Yaratıcı, Profesyonel ve Teknik varyasyonlar',
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: 'KVKK Uyumlu',
            description: 'Verileriniz satılmaz, reklam için kullanılmaz. Tam gizlilik koruması',
        },
    ]

    const steps = [
        { step: 1, text: 'ZIP dosyasını indirin', subtext: 'Aşağıdaki butonla uzantıyı indirin' },
        { step: 2, text: 'ZIP\'i açın', subtext: 'İndirilen dosyayı bir klasöre çıkarın' },
        { step: 3, text: 'Chrome\'a yükleyin', subtext: 'chrome://extensions → Geliştirici modu → Paketlenmemiş yükle' },
    ]

    return (
        <div className="min-h-screen relative bg-background-primary text-text-primary">
            <ShaderBackground />

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
                {/* Back button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Ana Sayfaya Dön
                </Link>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    {/* Extension Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary mb-6 shadow-lg shadow-accent-primary/25">
                        <Chrome className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                        <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-pink bg-clip-text text-transparent">
                            Antigravity
                        </span>{' '}
                        Chrome Uzantısı
                    </h1>
                    <p className="text-text-muted text-sm sm:text-base max-w-lg mx-auto">
                        Web sayfalarında metin seçin, anında optimize edilmiş AI promptları üretin.
                        ChatGPT, Gemini, Claude için.
                    </p>

                    {/* Version badge */}
                    <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        v2.0.0 — Manifest V3 + Side Panel
                    </div>
                </motion.div>

                {/* Download Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-background-secondary/60 backdrop-blur-xl border border-white/8 rounded-2xl p-6 sm:p-8 mb-8"
                >
                    <div className="flex flex-col items-center gap-5">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl hover:shadow-xl hover:shadow-accent-primary/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                        >
                            {downloading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    İndiriliyor...
                                </>
                            ) : downloaded ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    İndirildi — Tekrar İndir
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                                    Uzantıyı İndir
                                </>
                            )}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                        </button>

                        {downloaded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 text-sm text-green-400"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                antigravity-extension-v2.0.0.zip başarıyla indirildi!
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Installation Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-background-secondary/60 backdrop-blur-xl border border-white/8 rounded-2xl p-6 sm:p-8 mb-8"
                >
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Chrome className="w-5 h-5 text-accent-primary" />
                        Kurulum Adımları
                    </h2>

                    <div className="space-y-4">
                        {steps.map((s, i) => (
                            <motion.div
                                key={s.step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                                className="flex items-start gap-4 p-4 bg-white/3 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/30 flex items-center justify-center text-sm font-bold text-accent-primary">
                                    {s.step}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{s.text}</p>
                                    <p className="text-xs text-text-muted mt-0.5">{s.subtext}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-4 p-3 bg-accent-primary/5 border border-accent-primary/15 rounded-lg">
                        <p className="text-xs text-text-muted">
                            <strong className="text-accent-primary">💡 İpucu:</strong> Chrome adres çubuğuna{' '}
                            <code className="px-1.5 py-0.5 bg-white/5 rounded text-[11px] font-mono text-text-secondary">
                                chrome://extensions
                            </code>{' '}
                            yazarak uzantı sayfasına doğrudan gidebilirsiniz.
                        </p>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                            className="bg-background-secondary/40 backdrop-blur-sm border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/15 to-accent-secondary/15 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-3 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                            <p className="text-xs text-text-muted leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Privacy Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/15 rounded-full text-xs text-green-400/80">
                        <Shield className="w-3.5 h-3.5" />
                        KVKK Uyumlu · Veri satılmaz · Reklam yok · Açık kaynak
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
