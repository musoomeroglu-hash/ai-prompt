'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('message') || 'Authentication failed'

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
            <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
                    <p className="text-gray-400">{error}</p>
                </div>

                <Link
                    href="/"
                    className="inline-block w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all duration-200"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    )
}

export default function AuthError() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <ErrorContent />
        </Suspense>
    )
}
