'use client'

import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function ConfirmPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-black to-blue-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-md w-full bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                        <Mail className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-3">Emailini Kontrol Et</h1>
                    <p className="text-neutral-400 text-lg leading-relaxed">
                        Sana bir doğrulama bağlantısı gönderdik. <br />
                        Hesabını aktif etmek için lütfen email kutunu kontrol et.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
                    >
                        Giriş Sayfasına Dön
                    </Link>

                    <p className="text-xs text-neutral-500 mt-6">
                        Email gelmedi mi? Spam klasörünü kontrol etmeyi unutma.
                    </p>
                </div>
            </div>
        </div>
    )
}
