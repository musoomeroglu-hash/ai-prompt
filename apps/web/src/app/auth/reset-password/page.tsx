'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { validatePassword, getAuthErrorMessage } from '@/lib/auth-helpers'
import { Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import ShaderBackground from '@/components/ui/shader-background'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (!validatePassword(password)) {
                throw new Error('Şifre en az 8 karakter olmalıdır.')
            }

            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                router.push('/')
            }, 3000)

        } catch (err: any) {
            setError(getAuthErrorMessage(err.message))
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                <ShaderBackground opacity={0.4} />
                <div className="relative z-10 max-w-md w-full bg-neutral-900/50 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Şifreniz Güncellendi!</h2>
                    <p className="text-neutral-400">Ana sayfaya yönlendiriliyorsunuz...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden p-4">
            <ShaderBackground opacity={0.4} />

            <div className="relative z-10 max-w-md w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Yeni Şifre Belirle</h1>
                    <p className="text-neutral-400 text-sm">Lütfen hesabınız için yeni ve güçlü bir şifre belirleyin.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Yeni Şifre</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="En az 8 karakter"
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Şifreyi Güncelle <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
