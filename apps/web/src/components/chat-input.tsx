"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import {
    ArrowUpIcon,
    ChevronDown,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            if (reset) { textarea.style.height = `${minHeight}px`; return; }
            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY));
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );
    useEffect(() => { if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`; }, [minHeight]);
    useEffect(() => { const h = () => adjustHeight(); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, [adjustHeight]);
    return { textareaRef, adjustHeight };
}

import { CATEGORIES } from "@/lib/categories";

const categories = CATEGORIES.map(cat => ({
    id: cat.id,
    label: cat.title,
    icon: cat.icon
}));

// Official SVG logos for each AI platform
const aiLogos: Record<string, React.ReactNode> = {
    chatgpt: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" fill="#10a37f" />
        </svg>
    ),
    gemini: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" fill="url(#geminiGrad)" transform="translate(0,0)" />
            <defs>
                <linearGradient id="geminiGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1C7EF2" />
                    <stop offset="0.33" stopColor="#1BA0EB" />
                    <stop offset="0.66" stopColor="#6DB7F5" />
                    <stop offset="1" stopColor="#A8C7FA" />
                </linearGradient>
            </defs>
        </svg>
    ),
    claude: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M14.957 5.1l-2.19 6.618L19.08 5.1h2.853L13.657 18.9h-2.538l2.475-6.635-3.921-7.166H14.957zM7.065 5.1L2.067 18.9H4.71l4.995-13.8H7.065z" fill="#D97706" />
        </svg>
    ),
    copilot: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 2C6.477 2 2 6 2 10.8c0 2.1.8 4 2.1 5.5L3 22l4.5-2.3c1.4.5 2.9.8 4.5.8 5.523 0 10-4 10-8.8C22 6.9 17.523 2 12 2z" fill="#0078d4" />
            <path d="M8.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#fff" />
        </svg>
    ),
    perplexity: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 1L4 5v6.5L12 23l8-11.5V5L12 1zm0 2.5L17 6v4.5L12 18 7 10.5V6l5-2.5z" fill="#20808D" />
            <path d="M12 3.5v14.5M7 6l5 4.5L17 6M7 10.5L12 18l5-7.5" stroke="#20808D" strokeWidth="0.5" />
        </svg>
    ),
    midjourney: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M3 5h18v2H3zm3 4h12v2H6zm-2 4h16v2H4zm4 4h8v2H8z" fill="#fff" opacity="0.9" />
        </svg>
    ),
    dalle: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z" fill="#10a37f" />
            <rect x="7" y="7" width="10" height="10" rx="2" fill="#fff" opacity="0.3" />
            <circle cx="10" cy="10" r="1.5" fill="#fff" opacity="0.5" />
        </svg>
    ),
    stable_diffusion: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="1.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12h4c0-3.3 2.7-6 6-6V2z" fill="#6366f1" />
            <path d="M22 12c0 5.5-4.5 10-10 10v-4c3.3 0 6-2.7 6-6h4z" fill="#818cf8" />
        </svg>
    ),
    llama: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 2a8 8 0 0 0-5.3 2H6a2 2 0 0 0-2 2v1.5c-1.2 1.5-2 3.4-2 5.5 0 1.4.3 2.7.9 3.9L4 22h3l.5-3h9l.5 3h3l1.1-5.1c.6-1.2.9-2.5.9-3.9 0-2.1-.8-4-2-5.5V6a2 2 0 0 0-2-2h-.7A8 8 0 0 0 12 2zm-2.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="#0ea5e9" />
        </svg>
    ),
    mistral: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <rect x="1" y="2" width="5" height="5" fill="#f97316" />
            <rect x="18" y="2" width="5" height="5" fill="#f97316" />
            <rect x="1" y="9" width="5" height="5" fill="#f97316" />
            <rect x="6" y="9" width="6" height="5" fill="#f9a825" />
            <rect x="12" y="9" width="6" height="5" fill="#f9a825" />
            <rect x="18" y="9" width="5" height="5" fill="#f97316" />
            <rect x="1" y="16" width="5" height="5" fill="#f97316" />
            <rect x="18" y="16" width="5" height="5" fill="#f97316" />
        </svg>
    ),
};

const aiTargets = [
    { id: "chatgpt", label: "ChatGPT", color: "#10a37f" },
    { id: "gemini", label: "Gemini", color: "#4285f4" },
    { id: "claude", label: "Claude", color: "#d97706" },
    { id: "copilot", label: "Copilot", color: "#0078d4" },
    { id: "perplexity", label: "Perplexity", color: "#7c3aed" },
    { id: "midjourney", label: "Midjourney", color: "#e11d48" },
    { id: "dalle", label: "DALL-E", color: "#f59e0b" },
    { id: "stable_diffusion", label: "Stable Diffusion", color: "#6366f1" },
    { id: "llama", label: "Llama", color: "#0ea5e9" },
    { id: "mistral", label: "Mistral", color: "#f97316" },
];

interface ChatInputProps {
    onSubmit: (value: string, category: string, targetAI: string) => void;
    isGenerating: boolean;
    defaultCategory?: string;
}

export function ChatInput({ onSubmit, isGenerating, defaultCategory }: ChatInputProps) {
    const { t } = useLanguage();
    const [value, setValue] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory || "marketing");
    const [selectedAI, setSelectedAI] = useState("chatgpt");
    const [showAIDropdown, setShowAIDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });

    // Update selected category when defaultCategory changes
    useEffect(() => {
        if (defaultCategory) {
            setSelectedCategory(defaultCategory);
        }
    }, [defaultCategory]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowAIDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isGenerating) {
                onSubmit(value.trim(), selectedCategory, selectedAI);
                setValue("");
                adjustHeight(true);
            }
        }
    };

    const handleSend = () => {
        if (value.trim() && !isGenerating) {
            onSubmit(value.trim(), selectedCategory, selectedAI);
            setValue("");
            adjustHeight(true);
        }
    };

    const currentAI = aiTargets.find(a => a.id === selectedAI)!;

    return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-6">
            <div className="w-full">
                {/* Main Input Box */}
                <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-700/50 shadow-2xl shadow-black/20">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                            onKeyDown={handleKeyDown}
                            placeholder={t.placeholder(currentAI.label)}
                            className={cn(
                                "w-full px-4 py-3 sm:px-5 sm:py-4 resize-none bg-transparent border-none text-white text-sm sm:text-base",
                                "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-neutral-500 placeholder:text-sm min-h-[50px] sm:min-h-[60px]"
                            )}
                            style={{ overflow: "hidden" }}
                        />
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800/50">
                        <div className="flex items-center gap-3">
                            {/* AI Selector */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowAIDropdown(!showAIDropdown)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 transition-all text-[10px] sm:text-xs"
                                >
                                    <span>{aiLogos[currentAI.id]}</span>
                                    <span className="text-white font-medium truncate max-w-[60px] sm:max-w-none">{currentAI.label}</span>
                                    <ChevronDown className={cn("w-3 h-3 text-neutral-400 transition-transform", showAIDropdown && "rotate-180")} />
                                </button>

                                {showAIDropdown && (
                                    <div className="absolute bottom-full mb-2 left-0 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="p-2 border-b border-neutral-800">
                                            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-2">{t.selectTargetAI}</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                                            {aiTargets.map(ai => (
                                                <button
                                                    key={ai.id}
                                                    type="button"
                                                    onClick={() => { setSelectedAI(ai.id); setShowAIDropdown(false); }}
                                                    className={cn(
                                                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all",
                                                        selectedAI === ai.id
                                                            ? "bg-white/10 text-white"
                                                            : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                                    )}
                                                >
                                                    <span className="flex-shrink-0">{aiLogos[ai.id]}</span>
                                                    <span className="font-medium">{ai.label}</span>
                                                    {selectedAI === ai.id && <span className="ml-auto text-purple-400">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Category Badge */}
                            <span className="hidden sm:inline-flex text-xs text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                {t.categories[categories.find(c => c.id === selectedCategory)?.id || ''] || categories.find(c => c.id === selectedCategory)?.label}
                            </span>
                        </div>

                        {/* Send Button */}
                        <GradientButton
                            type="button"
                            onClick={handleSend}
                            disabled={!value.trim() || isGenerating}
                            className="!min-w-0 !px-4 !py-2 sm:!px-5 sm:!py-2.5 !rounded-xl"
                        >
                            {isGenerating ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <ArrowUpIcon className="w-4 h-4" />
                            )}
                        </GradientButton>
                    </div>
                </div>

                {/* Category Buttons */}
                <div className="flex items-center gap-2 mt-3 sm:mt-5 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center scrollbar-none mask-fade-sides">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                                    isActive
                                        ? "bg-white/10 border-white/30 text-white shadow-lg shadow-white/5"
                                        : "bg-neutral-900/50 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white"
                                )}
                            >
                                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span>{t.categories[cat.id] || cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
