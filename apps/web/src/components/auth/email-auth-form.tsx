'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { validateEmail, validatePassword, getAuthErrorMessage } from '@/lib/auth-helpers'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailAuthFormProps {
    onSuccess?: () => void
    onGoogleSignIn?: () => void
    onInteractionStart?: () => void
    onInteractionEnd?: () => void
}

export function EmailAuthForm({ onSuccess, onGoogleSignIn, onInteractionStart, onInteractionEnd }: EmailAuthFormProps) {
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
        <div className="w-full">
            {/* Mode Switcher */}
            {mode !== 'forgot' && (
                <div className="flex gap-1 sm:gap-2 mb-5 sm:mb-6 bg-white/5 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
                        className={cn(
                            "flex-1 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200",
                            mode === 'signin'
                                ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                        className={cn(
                            "flex-1 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200",
                            mode === 'signup'
                                ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
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
                        className="text-neutral-400 hover:text-white transition-colors text-xs sm:text-sm"
                    >
                        ← Geri
                    </button>
                    <span className="text-white font-medium ml-1 text-sm sm:text-base">Şifremi Unuttum</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label className="block text-xs sm:text-sm text-neutral-400 font-medium mb-1.5 sm:mb-2 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => onInteractionStart?.()}
                        onBlur={() => onInteractionEnd?.()}
                        placeholder="ornek@email.com"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                        required
                    />
                </div>

                {/* Password Input */}
                {mode !== 'forgot' && (
                    <div>
                        <div className="flex justify-between items-center mb-1.5 sm:mb-2 px-1">
                            <label className="text-xs sm:text-sm text-neutral-400 font-medium">Şifre</label>
                            {mode === 'signin' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-xs sm:text-sm text-purple-500 hover:text-purple-400 transition-colors"
                                >
                                    Şifremi Unuttum?
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => onInteractionStart?.()}
                                onBlur={() => onInteractionEnd?.()}
                                placeholder="••••••••"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors p-1.5 sm:p-2"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                        </div>
                        {mode === 'signup' && (
                            <p className="text-[10px] text-neutral-500 px-1 mt-1.5">En az 8 karakter olmalı</p>
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
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/10 active:scale-[0.98] text-sm sm:text-base"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {mode === 'signin' ? 'Giriş Yap' : mode === 'signup' ? 'Kayıt Ol' : 'Bağlantı Gönder'}
                            {mode !== 'forgot' && <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
                        </>
                    )}
                </button>
            </form>

            {/* Google Divider & Button */}
            {mode !== 'forgot' && onGoogleSignIn && (
                <>
                    <div className="my-4 sm:my-6 flex items-center gap-3 sm:gap-4">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-[10px] sm:text-xs font-medium text-neutral-500 uppercase tracking-wider">VEYA</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    <button
                        onClick={onGoogleSignIn}
                        className="w-full py-2.5 sm:py-3 bg-white text-neutral-900 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors text-sm sm:text-base active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </>
            )}
        </div>
    )
}
