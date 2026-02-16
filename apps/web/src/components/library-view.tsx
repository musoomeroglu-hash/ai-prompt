
'use client'

import { useEffect, useState } from 'react'
import { PromptCard } from '@/components/PromptCard'
import { PromptDetailView } from '@/components/prompt-detail-view'
import { Search, Filter, Plus } from 'lucide-react'
import Link from 'next/link'

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

export function LibraryView({ showFavorites }: { showFavorites?: boolean }) {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    // Local state instead of URL params
    const [categoryId, setCategoryId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.data || []))
    }, [])

    useEffect(() => {
        setLoading(true)
        const params = new URLSearchParams()
        if (showFavorites) params.append('favorites', 'true')
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
        // Search is already controlled by state if we want real-time, 
        // but for form submission style:
        // We can just rely on the input's onChange to update a temporary state 
        // and then flush it here, or just use the current 'search' state if we bound it.
        // For simplicity, let's bind the input to 'search'.
    }

    if (selectedPromptId) {
        return <PromptDetailView promptId={selectedPromptId} onBack={() => setSelectedPromptId(null)} />
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                        {showFavorites ? 'Favori Promptlarım' : 'Prompt Kütüphanesi'}
                    </h1>
                    <p className="text-neutral-400 mt-2">
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
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-neutral-200">
                            <Filter className="w-4 h-4" />
                            Kategoriler
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setCategoryId(null)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryId ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
                            >
                                Tümü
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoryId(cat.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === cat.id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'text-neutral-400 hover:bg-white/5'}`}
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Prompt ara..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors text-neutral-200 placeholder:text-neutral-600"
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
                                <div className="text-center py-12 text-neutral-500">
                                    Henüz prompt bulunamadı. İlk paylaşan sen ol!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {prompts.map(prompt => (
                                        <PromptCard
                                            key={prompt.id}
                                            prompt={prompt}
                                            onClick={() => setSelectedPromptId(prompt.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
