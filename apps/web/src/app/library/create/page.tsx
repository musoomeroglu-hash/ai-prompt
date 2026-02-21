'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function CreatePromptContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [error, setError] = useState('')

    // Pre-fill state
    const [title, setTitle] = useState(searchParams.get('title') || '')
    const [content, setContent] = useState(searchParams.get('content') || '')
    const [description, setDescription] = useState(searchParams.get('description') || '')
    const [targetAI, setTargetAI] = useState(searchParams.get('target_ai') || 'chatgpt')

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.data || []))
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            content: formData.get('content'),
            category_id: formData.get('category_id'),
            target_ai: formData.get('target_ai'),
            difficulty_level: formData.get('difficulty'),
            language: formData.get('language')
        }

        try {
            const res = await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const json = await res.json()

            if (!res.ok) throw new Error(json.error || 'Failed to create prompt')

            router.push('/library')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <Link href="/library" className="inline-flex items-center text-zinc-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kütüphaneye Dön
                </Link>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                    <h1 className="text-2xl font-bold mb-6">Yeni Prompt Paylaş</h1>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Başlık</label>
                            <input
                                name="title"
                                required
                                minLength={3}
                                maxLength={100}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Örn: Profesyonel Blog Yazısı Oluşturucu"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Kategori</label>
                                <select
                                    name="category_id"
                                    required
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none appearance-none"
                                >
                                    <option value="">Seçiniz...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Hedef Yapay Zeka</label>
                                <select
                                    name="target_ai"
                                    required
                                    value={targetAI}
                                    onChange={e => setTargetAI(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none appearance-none"
                                >
                                    <option value="chatgpt">ChatGPT</option>
                                    <option value="claude">Claude</option>
                                    <option value="gemini">Gemini</option>
                                    <option value="midjourney">Midjourney</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Zorluk Seviyesi</label>
                                <select
                                    name="difficulty"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                                >
                                    <option value="beginner">Başlangıç</option>
                                    <option value="medium">Orta</option>
                                    <option value="advanced">İleri</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Dil</label>
                                <select
                                    name="language"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                                >
                                    <option value="tr">Türkçe</option>
                                    <option value="en">İngilizce</option>
                                </select>
                            </div>
                        </div>

                        <div className="max-w-7xl mx-auto space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Kısa Açıklama</label>
                                <textarea
                                    name="description"
                                    required
                                    minLength={10}
                                    maxLength={500}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Bu prompt ne işe yarar? Hangi durumlarda kullanılır?"
                                    rows={3}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Prompt İçeriği</label>
                                <textarea
                                    name="content"
                                    required
                                    minLength={10}
                                    maxLength={10000}
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Prompt metnini buraya yapıştırın..."
                                    rows={8}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white font-mono text-sm focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link
                                href="/library"
                                className="px-6 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                İptal
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white px-8 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-purple-500/20"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Yayınla
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function CreatePromptPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        }>
            <CreatePromptContent />
        </Suspense>
    )
}
