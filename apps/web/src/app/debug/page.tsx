'use client'

import { createClient } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function DebugPage() {
    const [status, setStatus] = useState<any>({ loading: true })
    const [envVars, setEnvVars] = useState<any>({})

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Check Env Vars presence (not values)
                const vars = {
                    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : 'MISSING',
                    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
                    NODE_ENV: process.env.NODE_ENV
                }
                setEnvVars(vars)

                const supabase = createClient()
                const { data, error } = await supabase.auth.getSession()

                if (error) throw error

                setStatus({
                    success: true,
                    message: 'Supabase Connection Successful',
                    session: data.session ? 'Active' : 'No Session'
                })
            } catch (err: any) {
                setStatus({
                    success: false,
                    message: err.message,
                    details: err
                })
            }
        }

        checkConnection()
    }, [])

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <h1 className="text-2xl font-bold text-purple-500">System Diagnostics</h1>
                    <ThemeToggle />
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">1. Environment Variables</h2>
                    <div className="bg-white/5 p-4 rounded-lg space-y-2">
                        {Object.entries(envVars).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-neutral-400">{key}:</span>
                                <span className={value ? "text-green-400" : "text-red-500"}>
                                    {value === true ? 'PRESENT' : value === false ? 'MISSING' : value as string}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">2. Supabase Connection</h2>
                    <div className={`p-4 rounded-lg border ${status.loading ? 'border-blue-500/50 bg-blue-500/10' : status.success ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                        {status.loading ? (
                            <p>Testing connection...</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="font-bold text-lg">{status.message}</div>
                                {status.details && (
                                    <pre className="text-xs bg-black/50 p-2 rounded overflow-auto text-red-300">
                                        {JSON.stringify(status.details, null, 2)}
                                    </pre>
                                )}
                                {status.session && (
                                    <div>Session Status: <span className="text-purple-400">{status.session}</span></div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-xs text-neutral-500 pt-8">
                    Note: Delete this page after debugging.
                </div>
            </div>
        </div>
    )
}
