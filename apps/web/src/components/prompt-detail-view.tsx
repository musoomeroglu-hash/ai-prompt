
'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Copy, Save, Share2, Calendar } from 'lucide-react'

interface PromptDetail {
    id: string
    title: string
    content: string
    description: string
    target_ai: string
    difficulty_level: string
    language: string
    upvotes: number
    downvotes: number
    score: number
    created_at: string
    categories: { name: string } | null
}

interface PromptDetailViewProps {
    promptId: string
    onBack: () => void
}

export function PromptDetailView({ promptId, onBack }: PromptDetailViewProps) {
    const [prompt, setPrompt] = useState<PromptDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFavorite, setIsFavorite] = useState(false)
    const [favoriting, setFavoriting] = useState(false)


    useEffect(() => {
        // Fetch Prompt Data
        fetch(`/api/prompts/${promptId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error)
                } else {
                    setPrompt(data.data)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setError(err.message || 'Bir hata oluştu')
                setLoading(false)
            })

        // Fetch User Status (Favorite)
        fetch(`/api/prompts/${promptId}/user-status`)
            .then(res => res.json())
            .then(data => {
                if (data.isFavorite) setIsFavorite(true)
            })
            .catch(err => console.error('Failed to fetch user status', err))
    }, [promptId])

    const handleCopy = () => {
        if (prompt) {
            navigator.clipboard.writeText(prompt.content)
            alert('Prompt kopyalandı!')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center p-12 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
    )

    if (error) return (
        <div className="flex flex-col items-center justify-center p-12 text-red-400 gap-4">
            <p>Bir hata oluştu: {error}</p>
            <button onClick={onBack} className="text-white bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700">Geri Dön</button>
        </div>
    )

    if (!prompt) return (
        <div className="flex flex-col items-center justify-center p-12 text-zinc-400 gap-4">
            <p>Prompt bulunamadı</p>
            <button onClick={onBack} className="text-purple-400 hover:text-purple-300">Geri Dön</button>
        </div>
    )


    // For a robust implementation, we should fetch "isFavorite" status from API.
    // Let's rely on button click feedback for now or user can upgrade.

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: prompt?.title,
                    text: prompt?.description,
                    url: window.location.href,
                })
            } catch (err) {
                console.log('Share cancelled')
            }
        } else {
            handleCopy()
        }
    }

    const handleFavorite = async () => {
        if (!prompt || favoriting) return
        setFavoriting(true)

        try {
            const res = await fetch(`/api/prompts/${promptId}/favorite`, {
                method: 'POST'
            })

            if (res.status === 401) {
                alert('Favorilere eklemek için giriş yapmalısınız.')
                return
            }

            if (!res.ok) throw new Error('Action failed')

            const data = await res.json()
            setIsFavorite(data.favorited)
            alert(data.favorited ? 'Favorilere eklendi!' : 'Favorilerden çıkarıldı.')

        } catch (error) {
            console.error(error)
            alert('İşlem başarısız oldu.')
        } finally {
            setFavoriting(false)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-10 animate-fade-in">
            <button
                onClick={onBack}
                className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kütüphaneye Dön
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                                {prompt.categories?.name}
                            </span>
                            <span className="text-zinc-500 text-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(prompt.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            {prompt.title}
                        </h1>
                        <p className="text-zinc-400 mb-8 leading-relaxed">{prompt.description}</p>

                        <div className="relative group">
                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleCopy}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-xs border border-zinc-700"
                                >
                                    <Copy className="w-3 h-3" />
                                    Kopyala
                                </button>
                            </div>
                            <pre className="bg-black border border-zinc-800 rounded-xl p-6 overflow-x-auto font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap shadow-inner">
                                {prompt.content}
                            </pre>
                        </div>
                    </div>

                    {/* Comments Placeholder */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-zinc-400">Yorumlar</h3>
                        <p className="text-sm text-zinc-500">Yorum özelliği yakında eklenecek.</p>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <aside className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            {/* Score removed */}
                        </div>

                        <hr className="border-zinc-800 my-6" />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Hedef Model</span>
                                <span className="font-medium capitalize text-zinc-200">{prompt.target_ai}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Zorluk</span>
                                <span className="font-medium capitalize text-zinc-200">{prompt.difficulty_level}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Dil</span>
                                <span className="font-medium capitalize text-zinc-200">{prompt.language === 'tr' ? 'Türkçe' : prompt.language}</span>
                            </div>
                        </div>

                        <hr className="border-zinc-800 my-6" />

                        <button
                            onClick={handleFavorite}
                            disabled={favoriting}
                            className={`w-full py-3 rounded-xl transition-colors mb-3 flex items-center justify-center gap-2 border ${isFavorite
                                ? 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600'
                                : 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'}`}
                        >
                            <Save className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            {isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
                        </button>
                        <button
                            onClick={handleShare}
                            className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Paylaş
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}
