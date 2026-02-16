'use client'

import { useEffect, useState } from 'react'
import { PromptCard } from '@/components/PromptCard'
import { Search, Filter, Plus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

interface Category {
    id: string
    name: string
    slug: string
}

interface Prompt {
    id: string
    title: string
    description: string
    score: number
    view_count: number
    categories: {
        name: string
        slug: string
    } | null
}

function LibraryContent() {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const router = useRouter()

    const categoryId = searchParams.get('category_id')
    const search = searchParams.get('search') || ''

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.data || []))
    }, [])

    useEffect(() => {
        setLoading(true)
        const params = new URLSearchParams()
        if (categoryId) params.append('category_id', categoryId)
        if (search) params.append('search', search)

        fetch(`/api/prompts?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setPrompts(data.data || [])
                setLoading(false)
            })
    }, [categoryId, search])

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const q = formData.get('search') as string

        const params = new URLSearchParams(searchParams)
        if (q) params.set('search', q)
        else params.delete('search')

        router.push(`/library?${params.toString()}`)
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                            Prompt Kütüphanesi
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Topluluk tarafından oluşturulan en iyi yapay zeka promptlarını keşfedin.
                        </p>
                    </div>
                    <Link href="/library/create" className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-500/20">
                        <Plus className="w-4 h-4" />
                        Prompt Paylaş
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Kategoriler
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => router.push('/library')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryId ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                >
                                    Tümü
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams)
                                            params.set('category_id', cat.id)
                                            router.push(`/library?${params.toString()}`)
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === cat.id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                            <input
                                name="search"
                                defaultValue={search}
                                placeholder="Prompt ara..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </form>

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <>
                                {prompts.length === 0 ? (
                                    <div className="text-center py-12 text-zinc-500">
                                        Henüz prompt bulunamadı. İlk paylaşan sen ol!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {prompts.map(prompt => (
                                            <PromptCard key={prompt.id} prompt={prompt} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default function LibraryPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        }>
            <LibraryContent />
        </Suspense>
    )
}
