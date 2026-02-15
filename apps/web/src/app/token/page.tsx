'use client'

import { createClient } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function TokenPage() {
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setToken(session?.access_token || null)
            setLoading(false)
        })
    }, [supabase])

    const copyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token)
            alert('Token copied!')
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    if (!token) return <div className="p-8">Please log in to view your token.</div>

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Extension Access Token</h1>
            <p className="mb-4 text-gray-600">
                Copy this token and paste it into the Chrome Extension options page to enable
                AI generation from the extension.
            </p>

            <div className="bg-gray-100 p-4 rounded mb-4 break-all font-mono text-sm border">
                {token}
            </div>

            <button
                onClick={copyToken}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Copy Token
            </button>
        </div>
    )
}
