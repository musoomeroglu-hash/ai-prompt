import { useAnimatedText } from '@/hooks/use-animated-text'
import { Eye } from 'lucide-react'
import Link from 'next/link'

interface PromptCardProps {
    prompt: {
        id: string
        title: string
        description: string
        score: number
        view_count: number
        categories?: {
            name: string
            slug: string
        } | null
    }
    onClick?: () => void
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
    const animatedTitle = useAnimatedText(prompt.title)
    const animatedDescription = useAnimatedText(prompt.description, " ")

    const Content = (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 transition-all hover:border-purple-500/50 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-purple-500/10 h-full">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {prompt.categories?.name || 'Genel'}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors h-[28px]">
                {animatedTitle}
            </h3>

            <p className="text-zinc-400 text-sm line-clamp-2 mb-4 min-h-[40px]">
                {animatedDescription}
            </p>

            <div className="flex items-center gap-4 text-zinc-500 text-xs mt-auto">

                <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{prompt.view_count}</span>
                </div>
            </div>
        </div>
    )

    if (onClick) {
        return (
            <div onClick={onClick} className="block group cursor-pointer h-full">
                {Content}
            </div>
        )
    }

    return (
        <Link href={`/library/${prompt.id}`} className="block group h-full">
            {Content}
        </Link>
    )
}
