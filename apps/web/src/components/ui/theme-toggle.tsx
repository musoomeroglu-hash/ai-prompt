'use client'

import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
    className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { locale, toggleLocale } = useLanguage()
    const isTR = locale === 'tr'

    return (
        <div
            className={cn(
                'flex w-[72px] h-8 p-1 rounded-full cursor-pointer transition-all duration-300',
                'bg-zinc-950 border border-zinc-800 hover:border-zinc-600',
                className
            )}
            onClick={toggleLocale}
            role="button"
            tabIndex={0}
            title={isTR ? 'Switch to English' : 'Türkçe\'ye geç'}
        >
            <div className="flex justify-between items-center w-full relative">
                {/* Sliding pill */}
                <div
                    className={cn(
                        'absolute w-7 h-6 rounded-full transition-all duration-300 ease-in-out',
                        'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30',
                        isTR ? 'translate-x-0' : 'translate-x-[32px]'
                    )}
                />
                {/* TR label */}
                <span className={cn(
                    'relative z-10 flex items-center justify-center w-7 h-6 text-[11px] font-bold tracking-wide transition-colors duration-300',
                    isTR ? 'text-purple-300' : 'text-neutral-600'
                )}>
                    TR
                </span>
                {/* EN label */}
                <span className={cn(
                    'relative z-10 flex items-center justify-center w-7 h-6 text-[11px] font-bold tracking-wide transition-colors duration-300',
                    !isTR ? 'text-purple-300' : 'text-neutral-600'
                )}>
                    EN
                </span>
            </div>
        </div>
    )
}
