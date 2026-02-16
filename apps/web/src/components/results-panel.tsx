'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
    Copy, Check, Download, RefreshCw, Zap, FileText, Sparkles,
    Briefcase, Wrench, ChevronRight, ChevronDown, ChevronUp, Hash, Clock, Target, Layers, Share
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n'

/* ───────────────────────── Types ───────────────────────── */
interface ResultData {
    short?: string
    detailed?: string
    creative?: string
    professional?: string
    technical?: string
}

interface ResultsPanelProps {
    result: ResultData
    category?: string
    targetAI?: string
    generationTime?: number
    onRegenerate?: () => void
}

/* ────────────────────── Tab Config ─────────────────────── */
const TAB_CONFIG = [
    { key: 'short', label: 'Quick', icon: Zap, gradient: 'from-purple-500 to-fuchsia-500', glow: 'shadow-purple-500/20', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-300' },
    { key: 'detailed', label: 'Detailed', icon: FileText, gradient: 'from-amber-500 to-yellow-500', glow: 'shadow-amber-500/20', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-300' },
    { key: 'creative', label: 'Creative', icon: Sparkles, gradient: 'from-cyan-500 to-teal-500', glow: 'shadow-cyan-500/20', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-300' },
    { key: 'professional', label: 'Professional', icon: Briefcase, gradient: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/20', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
    { key: 'technical', label: 'Technical', icon: Wrench, gradient: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-500/20', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-300' },
] as const

const COLLAPSIBLE_TABS = new Set(['detailed', 'creative'])
const PREVIEW_CHARS = 220

/* ───────────────────── Helpers ─────────────────────────── */
function wordCount(text: string) { return text.trim().split(/\s+/).filter(Boolean).length }
function charCount(text: string) { return text.length }

function truncate(text: string, max: number) {
    if (text.length <= max) return text
    return text.slice(0, max).trimEnd() + '…'
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════════ */
export function ResultsPanel({ result, category, targetAI, generationTime, onRegenerate }: ResultsPanelProps) {
    const router = useRouter()
    const availableTabs = TAB_CONFIG.filter(tab => result[tab.key as keyof ResultData])
    const [activeTab, setActiveTab] = useState(availableTabs[0]?.key || 'short')
    const [copiedAll, setCopiedAll] = useState(false)
    const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({})
    const { t } = useLanguage()

    const activeConfig = TAB_CONFIG.find(tab => tab.key === activeTab) || TAB_CONFIG[0]
    const activeContent = result[activeTab as keyof ResultData] || ''

    const isCollapsible = COLLAPSIBLE_TABS.has(activeTab) && activeContent.length > PREVIEW_CHARS
    const isExpanded = expandedTabs[activeTab] ?? false

    const toggleExpand = () => {
        setExpandedTabs(prev => ({ ...prev, [activeTab]: !prev[activeTab] }))
    }

    const totalWords = Object.values(result).filter(Boolean).reduce((sum, v) => sum + wordCount(v!), 0)

    /* ── Actions ── */
    const handleCopyAll = useCallback(() => {
        const allText = availableTabs
            .map(t => `## ${t.label}\n${result[t.key as keyof ResultData]}`)
            .join('\n\n---\n\n')
        navigator.clipboard.writeText(allText)
        setCopiedAll(true)
        setTimeout(() => setCopiedAll(false), 2500)
    }, [result, availableTabs])

    const handleExport = useCallback((format: 'txt' | 'md') => {
        const ext = format
        const mime = format === 'md' ? 'text/markdown' : 'text/plain'
        const content = availableTabs
            .map(t => format === 'md'
                ? `## ${t.label}\n\n${result[t.key as keyof ResultData]}`
                : `[${t.label.toUpperCase()}]\n${result[t.key as keyof ResultData]}`)
            .join('\n\n' + (format === 'md' ? '---' : '════════════════════') + '\n\n')

        const blob = new Blob([content], { type: mime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prompt-results-${Date.now()}.${ext}`
        a.click()
        URL.revokeObjectURL(url)
    }, [result, availableTabs])

    if (availableTabs.length === 0) return null

    return (
        <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-8 pb-20 sm:pb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* ═══════ SUMMARY DASHBOARD ═══════ */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Category Badge */}
                    {category && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                            <Layers className="w-3 h-3" />
                            {category}
                        </span>
                    )}
                    {/* Target AI Badge */}
                    {targetAI && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                            <Target className="w-3 h-3" />
                            {targetAI}
                        </span>
                    )}
                    {/* Variants Count */}
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white/5 text-neutral-400 border border-white/[0.06]">
                        <Hash className="w-3 h-3" />
                        {availableTabs.length} {t.variants}
                    </span>
                    {/* Total Words */}
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white/5 text-neutral-400 border border-white/[0.06]">
                        <FileText className="w-3 h-3" />
                        {totalWords} {t.words}
                    </span>
                    {/* Generation Time */}
                    {generationTime && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white/5 text-neutral-400 border border-white/[0.06]">
                            <Clock className="w-3 h-3" />
                            {generationTime.toFixed(1)}s
                        </span>
                    )}
                </div>

                {/* TL;DR */}
                {result.short && (
                    <div className="mt-3 flex items-start gap-2">
                        <span className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-400/60">{t.tldr}</span>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                            {truncate(result.short, 180)}
                        </p>
                    </div>
                )}
            </div>

            {/* ═══════ TABS ═══════ */}
            <div className="flex gap-1.5 mb-3 sm:mb-4 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 mask-fade-sides">
                {availableTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap border flex-shrink-0',
                                isActive
                                    ? `${tab.bg} ${tab.border} ${tab.text} shadow-lg ${tab.glow}`
                                    : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06] hover:border-white/10'
                            )}
                        >
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {t.tabs[tab.key] || tab.label}
                        </button>
                    )
                })}
            </div>

            {/* ═══════ ACTIVE CONTENT ═══════ */}
            <div className={cn(
                'relative rounded-2xl border backdrop-blur-xl overflow-hidden transition-all duration-500',
                activeConfig.border,
                'bg-gradient-to-br from-white/[0.04] to-white/[0.01]'
            )}>
                {/* Gradient accent line at top */}
                <div className={cn('h-[2px] bg-gradient-to-r', activeConfig.gradient)} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', activeConfig.bg)}>
                            <activeConfig.icon className={cn('w-4 h-4', activeConfig.text)} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">{t.tabs[activeConfig.key] || activeConfig.label}</h3>
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                                {wordCount(activeContent)} {t.words} · {charCount(activeContent)} chars
                            </p>
                        </div>
                    </div>
                    <CopyButton text={activeContent} copyLabel={t.copy} copiedLabel={t.copied} />
                </div>

                {/* Content */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2">
                    <div className="relative bg-black/30 rounded-xl p-5 border border-white/[0.04]">
                        <p className={cn(
                            'text-sm text-neutral-200 whitespace-pre-wrap leading-[1.8] selection:bg-purple-500/30 transition-all duration-500',
                            isCollapsible && !isExpanded && 'max-h-[120px] overflow-hidden'
                        )}>
                            {activeContent}
                        </p>
                        {/* Gradient fade overlay */}
                        {isCollapsible && !isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-b-xl pointer-events-none" />
                        )}
                    </div>
                    {/* Expand / Collapse button */}
                    {isCollapsible && (
                        <button
                            onClick={toggleExpand}
                            className={cn(
                                'mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 border',
                                activeConfig.bg, activeConfig.border, activeConfig.text,
                                'hover:brightness-125'
                            )}
                        >
                            {isExpanded ? (
                                <><ChevronUp className="w-3.5 h-3.5" /> {t.showLess}</>
                            ) : (
                                <><ChevronDown className="w-3.5 h-3.5" /> {t.showMore}</>
                            )}
                        </button>
                    )}
                </div>

                {/* Quick nav dots */}
                <div className="flex justify-center gap-1.5 pb-4">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                                activeTab === tab.key
                                    ? cn('w-6', tab.bg, tab.border, 'border')
                                    : 'bg-white/10 hover:bg-white/20'
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* ═══════ ACTION BAR ═══════ */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
                {/* Copy All */}
                <button
                    onClick={handleCopyAll}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
                >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAll ? t.copiedAll : t.copyAll}
                </button>

                {/* Export Dropdown */}
                <div className="relative group">
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200">
                        <Download className="w-3.5 h-3.5" />
                        {t.exportLabel}
                        <ChevronRight className="w-3 h-3 rotate-90 opacity-50" />
                    </button>
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex flex-col bg-neutral-900/95 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl z-50 min-w-[120px]">
                        <button onClick={() => handleExport('txt')} className="px-4 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-white/10 text-left transition-colors">
                            📄 Export .txt
                        </button>
                        <button onClick={() => handleExport('md')} className="px-4 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-white/10 text-left transition-colors">
                            📝 Export .md
                        </button>
                    </div>
                </div>

                {/* Regenerate */}
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 text-purple-300 hover:from-purple-500/20 hover:to-fuchsia-500/20 hover:border-purple-500/30 transition-all duration-200"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t.regenerate}
                    </button>
                )}

                {/* Share to Library */}
                <button
                    onClick={() => {
                        const params = new URLSearchParams()
                        params.set('content', activeContent)
                        if (category) params.set('title', `${category} Prompt`) // Default title suggestion
                        if (targetAI) params.set('target_ai', targetAI.toLowerCase())
                        // Description is hard to guess, leave empty
                        router.push(`/library/create?${params.toString()}`)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-300 hover:from-blue-500/20 hover:to-indigo-500/20 hover:border-blue-500/30 transition-all duration-200 ml-auto"
                >
                    <Share className="w-3.5 h-3.5" />
                    Kütüphanede Paylaş
                </button>
            </div>
        </div>
    )
}

/* ════════════ COPY BUTTON SUB-COMPONENT ════════════════ */
function CopyButton({ text, copyLabel, copiedLabel }: { text: string; copyLabel: string; copiedLabel: string }) {
    const [copied, setCopied] = useState(false)

    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
            }}
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300',
                copied
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'bg-white/5 text-neutral-400 border border-white/[0.06] hover:text-white hover:bg-white/10 hover:border-white/15'
            )}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? copiedLabel : copyLabel}
        </button>
    )
}
