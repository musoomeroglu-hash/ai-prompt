'use client'

import { cn } from '@/lib/utils'

interface KineticDotsLoaderProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export default function KineticDotsLoader({ className, size = 'md' }: KineticDotsLoaderProps) {
    const dots = 4
    const sizeMap = {
        sm: { wrap: 'min-h-[80px]', gap: 'gap-3', h: 'h-12', w: 'w-4', dot: 'w-3 h-3', bounce: '-30px' },
        md: { wrap: 'min-h-[120px]', gap: 'gap-4', h: 'h-16', w: 'w-5', dot: 'w-4 h-4', bounce: '-36px' },
        lg: { wrap: 'min-h-[200px]', gap: 'gap-5', h: 'h-20', w: 'w-6', dot: 'w-5 h-5', bounce: '-40px' },
    }
    const s = sizeMap[size]

    return (
        <div className={cn('flex items-center justify-center p-6', s.wrap, className)}>
            <div className={cn('flex', s.gap)}>
                {[...Array(dots)].map((_, i) => (
                    <div key={i} className={cn('relative flex flex-col items-center justify-end', s.h, s.w)}>
                        {/* Bouncing dot */}
                        <div
                            className="relative z-10"
                            style={{
                                animation: 'gravity-bounce 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                                animationDelay: `${i * 0.15}s`,
                                willChange: 'transform',
                            }}
                        >
                            <div
                                className={cn(s.dot, 'rounded-full bg-gradient-to-b from-amber-300 to-orange-600 shadow-[0_0_15px_rgba(251,146,60,0.6)]')}
                                style={{
                                    animation: 'rubber-morph 1.4s linear infinite',
                                    animationDelay: `${i * 0.15}s`,
                                    willChange: 'transform',
                                }}
                            />
                            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/60 rounded-full blur-[0.5px]" />
                        </div>

                        {/* Floor ripple */}
                        <div
                            className="absolute bottom-0 w-8 h-2 border border-orange-500/30 rounded-[100%] opacity-0"
                            style={{
                                animation: 'ripple-expand 1.4s linear infinite',
                                animationDelay: `${i * 0.15}s`,
                            }}
                        />

                        {/* Shadow */}
                        <div
                            className="absolute -bottom-1 w-4 h-1 rounded-[100%] bg-orange-500/40 blur-sm"
                            style={{
                                animation: 'shadow-breathe 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                                animationDelay: `${i * 0.15}s`,
                            }}
                        />
                    </div>
                ))}
            </div>

            <style jsx>{`
        @keyframes gravity-bounce {
          0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
          50% { transform: translateY(${s.bounce}); animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
          100% { transform: translateY(0); }
        }
        @keyframes rubber-morph {
          0% { transform: scale(1.4, 0.6); }
          5% { transform: scale(0.9, 1.1); }
          15% { transform: scale(1, 1); }
          50% { transform: scale(1, 1); }
          85% { transform: scale(0.9, 1.1); }
          100% { transform: scale(1.4, 0.6); }
        }
        @keyframes shadow-breathe {
          0% { transform: scale(1.4); opacity: 0.6; }
          50% { transform: scale(0.5); opacity: 0.1; }
          100% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes ripple-expand {
          0% { transform: scale(0.5); opacity: 0; border-width: 4px; }
          5% { opacity: 0.8; }
          30% { transform: scale(1.5); opacity: 0; border-width: 0px; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
        </div>
    )
}
