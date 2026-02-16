'use client'

import { createClient } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShaderBackground } from '@/components/ui/shader-background'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import KineticDotsLoader from '@/components/ui/kinetic-dots-loader'
import { ChatInput } from '@/components/chat-input'
import { ResultsPanel } from '@/components/results-panel'
import { LibraryView } from '@/components/library-view'
import { EmailAuthForm } from '@/components/auth/email-auth-form'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
import { Clock, LogOut, Puzzle, Crown, Zap, User, ArrowRight, BookOpen, MessageSquare, Save } from 'lucide-react'
import Link from 'next/link'
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from '@/components/ui/sidebar'
import { motion } from 'framer-motion'

interface SubscriptionStatus {
  plan: string
  status: string
  isTrialActive: boolean
  trialDaysRemaining: number
  isSubscriptionActive: boolean
  canGenerate: boolean
  reason?: string
  monthlyPromptsUsed: number
  monthlyPromptLimit: number
  dailyPromptsUsed: number
  dailyPromptLimit: number
  monthlyUsagePercent: number
  quotaWarning: 'none' | 'warning_80' | 'warning_90' | 'exceeded'
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'chat' | 'library' | 'favorites'>('chat')

  const supabase = createClient()
  const router = useRouter()
  const { t } = useLanguage()

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google sign in error:', error)
    }
  }

  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [lastCategory, setLastCategory] = useState('')
  const [lastTargetAI, setLastTargetAI] = useState('')
  const [lastRequest, setLastRequest] = useState('')
  const [generationTime, setGenerationTime] = useState(0)

  useEffect(() => {
    const handleSession = (sessionData: any) => {
      let activeSession = sessionData;

      // Defensive check: if session is a string (can happen in some SSR/edge cases), try parsing it
      if (typeof activeSession === 'string') {
        try {
          activeSession = JSON.parse(activeSession);
        } catch (e) {
          console.error('Failed to parse session string:', e);
          activeSession = null;
        }
      }

      setSession(activeSession)
      setLoading(false)

      if (activeSession?.user?.id) {
        fetchHistory(activeSession.user.id)
        fetchSubscription()
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => authSub.unsubscribe()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription')
      const data = await res.json()
      if (data.subscription) setSubscription(data.subscription)
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setResult(null)
    setHistory([])
    setSubscription(null)
    router.push('/login')
  }

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setHistory(data)
  }

  const handleRegenerate = () => {
    if (lastRequest && lastCategory && lastTargetAI) {
      handleGenerate(lastRequest, lastCategory, lastTargetAI)
    }
  }

  const handleGenerate = async (userRequest: string, category: string, targetAI: string) => {
    if (!userRequest) return
    setGenerating(true)
    setResult(null)
    setLastCategory(category)
    setLastTargetAI(targetAI)
    setLastRequest(userRequest)
    const startTime = Date.now()

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          category,
          userRequest,
          targetModel: targetAI,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.subscription) {
          setSubscription(data.subscription)
          if (data.subscription.reason?.includes('Trial expired') || data.subscription.reason?.includes('Upgrade')) {
            router.push('/pricing')
            return
          }
        }
        throw new Error(data.error || 'Failed')
      }

      setResult(data.result)
      setGenerationTime((Date.now() - startTime) / 1000)
      if (data.subscription) setSubscription(data.subscription)
      if (session?.user?.id) fetchHistory(session.user.id)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black dark:bg-black flex items-center justify-center relative overflow-hidden">
      <ShaderBackground opacity={0.4} />
      <div className="relative z-10">
        <KineticDotsLoader size="lg" />
      </div>
    </div>
  )

  if (!session) {
    // DEV MODE: Allow access without login
    if (process.env.NODE_ENV === 'development') {
      // Create a mock session object so the UI doesn't crash accessing session.user.id
      const mockSession = { user: { id: 'dev-user-id', email: 'dev@example.com' } }
      if (!session) setSession(mockSession)
      // We return null momentarily while state updates to avoid flicker loop
      return null
    }

    if (!loading) {
      // Show landing page with 2-Column Layout
      return (
        <main className="min-h-screen relative bg-black overflow-hidden flex flex-col pb-safe-area-inset-bottom">
          <ShaderBackground opacity={0.7} className="opacity-70 sm:opacity-80 lg:opacity-100" />

          <div className="relative z-10 container mx-auto px-4 flex-1 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center pt-16 sm:pt-20 lg:pt-0">

              {/* ═══ Left Column: Content ═══ */}
              <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left px-4 sm:px-6 lg:px-0 lg:pr-8 py-8 sm:py-12 lg:py-0">
                {/* Logo */}
                <div className="mb-6 sm:mb-8 lg:mb-8 flex justify-center lg:justify-start">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mx-auto lg:mx-0">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black" />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight text-white leading-tight">
                  Master the Art of <br />
                  <span className="block mt-1 lg:mt-0 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    AI Prompting
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base lg:text-xl text-neutral-400 mb-6 sm:mb-8 max-w-md lg:max-w-xl mx-auto lg:mx-0 px-2 sm:px-0 leading-relaxed">
                  Create, refine, and organize your prompts with advanced AI tools.
                  Join thousands of creators building better with AI.
                </p>

                {/* Features */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-neutral-500 font-medium mb-8 sm:mb-12 lg:mb-0">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <Crown className="w-4 h-4 text-orange-400" />
                    <span>Premium Features</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </div>

              {/* ═══ Right Column: Auth Card ═══ */}
              <div className="w-full px-4 sm:px-6 lg:px-0 pb-8 sm:pb-12 lg:pb-0 flex items-center justify-center">
                <div className="w-full max-w-sm sm:max-w-md mx-auto relative group">
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 rounded-xl lg:rounded-2xl blur-lg lg:blur-xl opacity-20 lg:opacity-30 animate-pulse transition-opacity duration-1000 group-hover:opacity-50"></div>

                  {/* Main Card */}
                  <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl lg:rounded-2xl p-6 sm:p-8 shadow-2xl">
                    <EmailAuthForm
                      onSuccess={() => window.location.reload()}
                      onGoogleSignIn={handleGoogleSignIn}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      )
    }
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <ShaderBackground opacity={0.4} />
        <div className="relative z-10">
          <KineticDotsLoader size="lg" />
        </div>
      </div>
    )
  }

  const isPaid = subscription && subscription.plan !== 'free'

  return (
    <div className="min-h-screen relative w-full bg-black dark:bg-black flex overflow-hidden text-neutral-200">
      <ShaderBackground opacity={0.6} />

      {/* ═══ Top-Right Corner: Quota + Upgrade + Language ═══ */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {/* Quota bar — always visible */}
        {subscription && subscription.monthlyPromptLimit > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full">
            <div className="w-20 bg-neutral-800 rounded-full h-1.5">
              <div className={cn("h-1.5 rounded-full transition-all",
                subscription.quotaWarning === 'exceeded' ? 'bg-red-500' :
                  subscription.quotaWarning === 'warning_90' ? 'bg-red-500' :
                    subscription.quotaWarning === 'warning_80' ? 'bg-amber-500' : 'bg-orange-500'
              )} style={{ width: `${Math.min(100, subscription.monthlyUsagePercent)}%` }} />
            </div>
            <span className="text-[10px] text-neutral-400 whitespace-nowrap">
              {subscription.monthlyPromptsUsed}/{subscription.monthlyPromptLimit}
            </span>
          </div>
        )}

        {subscription && subscription.isTrialActive && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" />
            {t.trialDays(subscription.trialDaysRemaining)}
          </span>
        )}

        {!isPaid && (
          <Link href="/pricing"
            className="group relative overflow-hidden flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-black bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all">
            <Crown className="w-3.5 h-3.5" />
            {t.upgrade}
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        {isPaid && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 text-orange-400 rounded-full backdrop-blur-sm">
            <Crown className="w-3 h-3" /> {t.planNames[subscription?.plan || 'free']}
          </span>
        )}

        <ThemeToggle />
      </div>

      {/* ═══ Sidebar Navigation ═══ */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="relative z-30 justify-between gap-6">
          {/* Top */}
          <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-1">
            <SidebarLogo open={sidebarOpen} onReset={() => setCurrentView('chat')} />

            <div className="h-px bg-white/5 my-1" />

            {/* Nav Links */}
            <SidebarLink
              link={{
                label: "Sohbet",
                href: "#",
                icon: <MessageSquare className="w-5 h-5 text-neutral-400 flex-shrink-0" />,
              }}
              className={cn("text-neutral-300 hover:text-white transition-colors", currentView === 'chat' && "text-white bg-white/5 rounded-lg")}
              onClick={(e) => {
                e.preventDefault()
                setCurrentView('chat')
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
            />

            <SidebarLink
              link={{
                label: "Kütüphane",
                href: "#",
                icon: <BookOpen className="w-5 h-5 text-neutral-400 flex-shrink-0" />,
              }}
              className={cn("text-neutral-300 hover:text-white transition-colors", currentView === 'library' && "text-white bg-white/5 rounded-lg")}
              onClick={(e) => {
                e.preventDefault()
                setCurrentView('library')
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
            />
            <SidebarLink
              link={{
                label: "Favorilerim",
                href: "#",
                icon: <Save className="w-5 h-5 text-neutral-400 flex-shrink-0" />,
              }}
              className={cn("text-neutral-300 hover:text-white transition-colors", currentView === 'favorites' && "text-white bg-white/5 rounded-lg")}
              onClick={(e) => {
                e.preventDefault()
                setCurrentView('favorites')
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
            />
            <SidebarLink
              link={{
                label: t.account,
                href: "/account",
                icon: <User className="w-5 h-5 text-neutral-400 flex-shrink-0" />,
              }}
              className="text-neutral-300 hover:text-white transition-colors"
            />



            <SidebarLink
              link={{
                label: "Extension",
                href: "/extension",
                icon: <Puzzle className="w-5 h-5 text-neutral-400 flex-shrink-0" />,
              }}
              className="text-neutral-300 hover:text-white transition-colors"
            />



            {/* History section inside sidebar */}
            {sidebarOpen && (
              <>
                <div className="h-px bg-white/5 my-1" />
                <div className="flex flex-col min-h-0 flex-1">
                  <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-1 mb-2">{t.recentHistory}</h4>
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {history.length > 0 ? history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setResult(item.result_json);
                          setLastCategory(item.category);
                          setLastTargetAI(item.target_model);
                          setGenerationTime(0);
                        }}
                        className="group p-2.5 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/20 uppercase">{item.category}</span>
                          <span className="text-[9px] text-neutral-600">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 group-hover:text-neutral-300 transition-colors">{item.user_request}</p>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-24 text-neutral-600 text-xs">
                        <Clock className="w-6 h-6 mb-1.5 opacity-30" /> {t.noHistory}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="h-px bg-white/5" />
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 py-2 text-red-400/70 hover:text-red-400 transition-colors w-full"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <motion.span
                  animate={{ opacity: sidebarOpen ? 1 : 0, display: sidebarOpen ? "inline-block" : "none" }}
                  className="text-sm whitespace-nowrap"
                >
                  {t.logout}
                </motion.span>
              )}
            </button>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* ═══ Main Content ═══ */}
      <div className="relative z-20 flex-1 flex flex-col h-screen overflow-hidden">
        {/* Scrollable Area */}
        <main className={cn(
          "flex-1 overflow-y-auto px-4 pb-4 scroll-smooth custom-scrollbar",
          (currentView === 'chat' && !result && !generating) ? "flex flex-col items-center justify-center" : ""
        )}>
          {currentView === 'chat' ? (
            <div className={cn(
              "w-full max-w-4xl mx-auto",
              (!result && !generating) ? "text-center" : "py-10"
            )}>
              {!result && !generating && (
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-orange-200 via-yellow-300 to-amber-400 mb-3">
                    {t.heroTitle}
                  </h2>
                  <p className="text-neutral-500 text-sm max-w-md mx-auto">
                    {t.heroSubtitle}
                  </p>
                </div>
              )}

              {result && (
                <ResultsPanel
                  result={result}
                  category={lastCategory}
                  targetAI={lastTargetAI}
                  generationTime={generationTime}
                  onRegenerate={handleRegenerate}
                />
              )}

              {generating && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <KineticDotsLoader size="sm" />
                  <TextShimmer className="text-sm font-medium" duration={1.5}>
                    {t.generating}
                  </TextShimmer>
                </div>
              )}
            </div>
          ) : currentView === 'favorites' ? (
            <LibraryView showFavorites={true} />
          ) : (
            <LibraryView />
          )}
        </main>

        {/* Fixed Bottom Input Area - Only for Chat View */}
        {currentView === 'chat' && (
          <div className="w-full p-4 z-40 shrink-0">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSubmit={handleGenerate} isGenerating={generating} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

/* ═══ Helper ═══ */
function SidebarLogo({ open, onReset }: { open: boolean; onReset: () => void }) {
  return (
    <div className="flex items-center gap-2 py-2 cursor-pointer" onClick={onReset}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
        <Zap className="w-4 h-4 text-black" />
      </div>
      {open && (
        <motion.span
          animate={{ opacity: open ? 1 : 0, display: open ? "inline-block" : "none" }}
          className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-400 to-amber-300 whitespace-nowrap"
        >
          AI Prompt App
        </motion.span>
      )}
    </div>
  )
}
