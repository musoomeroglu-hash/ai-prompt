'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { validateEmail, validatePassword, getAuthErrorMessage } from '@/lib/auth-helpers'
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailAuthFormProps {
    onSuccess?: () => void
}

export function EmailAuthForm({ onSuccess }: EmailAuthFormProps) {
    const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (!validateEmail(email)) {
                throw new Error('Geçerli bir email adresi giriniz.')
            }

            if (mode !== 'forgot' && !validatePassword(password)) {
                throw new Error('Şifre en az 8 karakter olmalıdır.')
            }

            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setSuccess('Doğrulama maili gönderildi! Lütfen gelen kutunuzu kontrol edin.')
                setEmail('')
                setPassword('')
            }

            else if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                if (onSuccess) onSuccess()
            }

            else if (mode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/reset-password`,
                })
                if (error) throw error
                setSuccess('Şifre sıfırlama bağlantısı gönderildi.')
            }

        } catch (err: any) {
            setError(getAuthErrorMessage(err.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Mode Switcher */}
            {mode !== 'forgot' && (
                <div className="flex p-1 bg-neutral-900 rounded-lg mb-6 border border-white/5">
                    <button
                        onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200",
                            mode === 'signin'
                                ? "bg-neutral-800 text-white shadow-lg"
                                : "text-neutral-400 hover:text-white"
                        )}
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200",
                            mode === 'signup'
                                ? "bg-neutral-800 text-white shadow-lg"
                                : "text-neutral-400 hover:text-white"
                        )}
                    >
                        Kayıt Ol
                    </button>
                </div>
            )}

            {/* Form Title & Back Button */}
            {mode === 'forgot' && (
                <div className="mb-6 flex items-center gap-2">
                    <button
                        onClick={() => setMode('signin')}
                        className="text-neutral-400 hover:text-white transition-colors"
                    >
                        ← Geri
                    </button>
                    <span className="text-white font-medium">Şifremi Unuttum</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                    <label className="text-xs text-neutral-400 font-medium ml-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-400 transition-colors" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                {mode !== 'forgot' && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs text-neutral-400 font-medium">Şifre</label>
                            {mode === 'signin' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-[10px] text-neutral-500 hover:text-orange-400 transition-colors"
                                >
                                    Şifremi unuttum?
                                </button>
                            )}
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {mode === 'signup' && (
                            <p className="text-[10px] text-neutral-500 px-1">En az 8 karakter olmalı</p>
                        )}
                    </div>
                )}

                {/* Feedback Messages */}
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-200">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{success}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold py-3 px-4 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {mode === 'signin' ? 'Giriş Yap' : mode === 'signup' ? 'Hesap Oluştur' : 'Bağlantı Gönder'}
                            {mode !== 'forgot' && <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
