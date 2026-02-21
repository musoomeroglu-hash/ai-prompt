'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Copy, ThumbsUp, ThumbsDown, Save, Share2, MoreHorizontal, Calendar, User, Tag } from 'lucide-react'
import Link from 'next/link'

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

export default function PromptDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [prompt, setPrompt] = useState<PromptDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [voting, setVoting] = useState(false)

    useEffect(() => {
        fetch(`/api/prompts/${id}`)
            .then(res => res.json())
            .then(data => {
                setPrompt(data.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [id])

    const handleVote = async (type: 'upvote' | 'downvote') => {
        if (!prompt) return
        setVoting(true)
        try {
            const res = await fetch(`/api/prompts/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote_type: type })
            })

            if (res.ok) {
                // Optimistic update or refetch
                // For MVP simply refetch
                const updated = await fetch(`/api/prompts/${id}`).then(r => r.json())
                setPrompt(updated.data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setVoting(false)
        }
    }

    const handleCopy = () => {
        if (prompt) {
            navigator.clipboard.writeText(prompt.content)
            alert('Prompt kopyalandı!')
        }
    }

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>
    if (!prompt) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Prompt bulunamadı</div>

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/library" className="inline-flex items-center text-zinc-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kütüphaneye Dön
                </Link>

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

                            <h1 className="text-3xl font-bold mb-4">{prompt.title}</h1>
                            <p className="text-zinc-400 mb-8">{prompt.description}</p>

                            <div className="relative group">
                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={handleCopy}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-xs"
                                    >
                                        <Copy className="w-3 h-3" />
                                        Kopyala
                                    </button>
                                </div>
                                <pre className="bg-black border border-zinc-800 rounded-xl p-6 overflow-x-auto font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {prompt.content}
                                </pre>
                            </div>
                        </div>

                        {/* Comments Section (Optional for future) */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-zinc-400">Yorumlar</h3>
                            <p className="text-sm text-zinc-500">Yorum özelliği yakında eklenecek.</p>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <aside className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{prompt.score}</div>
                                    <div className="text-xs text-zinc-500">Puan</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleVote('upvote')}
                                        disabled={voting}
                                        className="p-3 bg-zinc-800 hover:bg-green-500/20 hover:text-green-400 rounded-lg transition-colors"
                                    >
                                        <ThumbsUp className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleVote('downvote')}
                                        disabled={voting}
                                        className="p-3 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        <ThumbsDown className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <hr className="border-zinc-800 my-6" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400">Hedef Model</span>
                                    <span className="font-medium capitalize">{prompt.target_ai}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400">Zorluk</span>
                                    <span className="font-medium capitalize">{prompt.difficulty_level}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400">Dil</span>
                                    <span className="font-medium capitalize">{prompt.language === 'tr' ? 'Türkçe' : prompt.language}</span>
                                </div>
                            </div>

                            <hr className="border-zinc-800 my-6" />

                            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition-colors mb-3 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" />
                                Favorilere Ekle
                            </button>
                            <button className="w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Paylaş
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
