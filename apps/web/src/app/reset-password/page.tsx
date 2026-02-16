'use client'

import { createClient } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ShaderBackground from '@/components/ui/shader-background'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Loader from '@/components/ui/loader'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        try {
            if (password !== confirmPassword) throw new Error('Passwords do not match')

            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error

            setMessage({ type: 'success', text: 'Password updated successfully! Redirecting...' })
            setTimeout(() => router.push('/login'), 2000)
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden p-4">
            <ShaderBackground opacity={0.5} />

            <div className="absolute top-4 right-4 z-30">
                <ThemeToggle />
            </div>

            <div className="relative z-20 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 pb-0 text-center">
                    <Link href="/" className="inline-block mb-6">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400">
                            Antigravity
                        </h1>
                    </Link>
                    <h2 className="text-xl font-semibold text-white mb-2">Set New Password</h2>
                    <p className="text-neutral-400 text-sm">
                        Enter your new password below to secure your account.
                    </p>
                </div>

                <div className="p-8 pt-6">
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="New Password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm New Password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                />
                            </div>
                        </div>

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
                            className="group relative w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <Loader size="sm" />
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
