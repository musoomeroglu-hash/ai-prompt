'use client'

import { createClient } from '@/lib/supabaseClient'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ShaderBackground from '@/components/ui/shader-background'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Loader from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Github, Chrome, AlertCircle, CheckCircle2, Zap } from 'lucide-react'

function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login')
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const error = searchParams.get('error')
        if (error) {
            setMessage({ type: 'error', text: 'Authentication failed. Please try again.' })
        }
    }, [searchParams])

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/auth/callback`,
            },
        })
        if (error) {
            setMessage({ type: 'error', text: error.message })
            setLoading(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            if (activeTab === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                // Redirect is handled by auth state change or callback usually, but manual push here
                router.push('/')
            } else if (activeTab === 'register') {
                const confirmPassword = formData.get('confirmPassword') as string
                if (password !== confirmPassword) throw new Error('Passwords do not match')

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback` }
                })
                if (error) throw error
                setMessage({ type: 'success', text: 'Check your email for the confirmation link!' })
            } else if (activeTab === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?next=/reset-password`,
                })
                if (error) throw error
                setMessage({ type: 'success', text: 'Password reset link sent to your email.' })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative z-20 w-full max-w-md bg-background-secondary/80 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0 text-center">
                <Link href="/" className="inline-block mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        Antigravity
                    </h1>
                </Link>
                <h2 className="text-xl font-semibold text-white mb-2">
                    {activeTab === 'login' && 'Welcome back'}
                    {activeTab === 'register' && 'Create an account'}
                    {activeTab === 'forgot' && 'Reset password'}
                </h2>
                <p className="text-text-secondary text-sm">
                    {activeTab === 'login' && 'Enter your details to access your workspace'}
                    {activeTab === 'register' && 'Start your journey with AI-powered prompts'}
                    {activeTab === 'forgot' && 'Enter your email to receive reset instructions'}
                </p>
            </div>

            {/* Tabs */}
            {activeTab !== 'forgot' && (
                <div className="flex p-2 gap-1 mt-6 mx-8 bg-background-tertiary rounded-xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'login' ? "bg-accent-primary/20 text-accent-primary shadow-sm" : "text-text-muted hover:text-white hover:bg-white/5"
                        )}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'register' ? "bg-accent-primary/20 text-accent-primary shadow-sm" : "text-text-muted hover:text-white hover:bg-white/5"
                        )}
                    >
                        Sign Up
                    </button>
                </div>
            )}

            <div className="p-8 pt-6">
                {/* Social Login */}
                {activeTab !== 'forgot' && (
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            Continue with Google
                        </button>


                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <span className="relative z-10 px-4 bg-background-secondary text-xs text-text-muted uppercase tracking-widest">Or</span>
                        </div>
                    </div>
                )}

                {process.env.NODE_ENV === 'development' && activeTab === 'login' && (
                    <div className="mb-6">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 border border-white/10 text-neutral-300 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Zap className="w-4 h-4 text-accent-secondary" />
                            Skip Login (Dev Only)
                        </button>
                    </div>
                )}

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-white/10 rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
                            />
                        </div>

                        {activeTab !== 'forgot' && (
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-white/10 rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
                                />
                            </div>
                        )}

                        {activeTab === 'register' && (
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-white/10 rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {activeTab === 'login' && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveTab('forgot')}
                                className="text-xs text-text-muted hover:text-white transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {message && (
                        <div className={cn(
                            "p-3 rounded-xl text-sm flex items-center gap-2",
                            message.type === 'error' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        )}>
                            {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? (
                            <Loader size="sm" />
                        ) : (
                            <>
                                {activeTab === 'login' && 'Sign In'}
                                {activeTab === 'register' && 'Create Account'}
                                {activeTab === 'forgot' && 'Send Reset Link'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>

                    {activeTab === 'forgot' && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className="w-full py-2 text-sm text-text-muted hover:text-white transition-colors"
                        >
                            Back to Login
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}

const LoginPage = () => {
    return (
        <div className="min-h-screen relative w-full flex flex-col items-center justify-center overflow-hidden p-4 bg-transparent">
            <ShaderBackground />

            <div className="absolute top-4 right-4 z-30">
                <ThemeToggle />
            </div>

            <Suspense fallback={<Loader size="lg" />}>
                <LoginForm />
            </Suspense>

            <div className="relative z-20 mt-8 text-center">
                <p className="text-xs text-text-muted">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}

export default LoginPage;

