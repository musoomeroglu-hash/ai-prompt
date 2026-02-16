'use client'

import { createClient } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ShaderBackground from '@/components/ui/shader-background'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Loader from '@/components/ui/loader'
import { GradientSpinner } from '@/components/ui/gradient-spinner'
import { ChatInput } from '@/components/chat-input'
import { ResultsPanel } from '@/components/results-panel'
import { InteractiveLogin } from '@/components/auth/interactive-login'
import { HeroGeometric } from '@/components/ui/hero-geometric'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n'
import { Clock, LogOut, Puzzle, Crown, Zap, User, ArrowRight, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [showLogin, setShowLogin] = useState(false) // State to toggle between Hero and Login

  const supabase = createClient()
  const router = useRouter()
  const { t } = useLanguage()

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

  useEffect(() => {
    // Check for selected category in localStorage on load
    if (typeof window !== 'undefined') {
      const cat = localStorage.getItem('selectedCategory');
      if (cat) setLastCategory(cat);
    }
  }, []);

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
    setShowLogin(false) // Reset to Hero on logout
    // router.push('/login') // No longer needed with single page app flow
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
        // Show detailed error if available
        throw new Error(data.details || data.error || 'Bir hata oluştu')
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
    <div className="min-h-screen bg-background-primary flex items-center justify-center relative overflow-hidden">
      <ShaderBackground />
      <div className="relative z-10">
        <Loader size="lg" />
      </div>
    </div>
  )

  if (!session) {
    // DEV MODE Bypass
    if (process.env.NODE_ENV === 'development' && false) { // Disabled dev bypass for now to show new UI
      // ... (existing dev mode logic if needed)
    }

    return (
      <AnimatePresence mode="wait">
        {!showLogin ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroGeometric onStart={() => setShowLogin(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <InteractiveLogin
              onLoginSuccess={() => window.location.reload()}
              onGoogleSignIn={async () => {
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                  if (error) alert(error.message)
                } catch (err: any) {
                  alert(err.message)
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const isPaid = subscription && subscription.plan !== 'free'

  return (
    <div className="min-h-screen relative w-full flex overflow-hidden text-text-primary bg-transparent">
      <ShaderBackground />

      {/* ═══ Top-Right Corner: Quota + Upgrade + Language ═══ */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {/* Quota bar — always visible */}
        {subscription && subscription.monthlyPromptLimit > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background-secondary/40 backdrop-blur-sm border border-white/10 rounded-full">
            <div className="w-20 bg-background-tertiary rounded-full h-1.5">
              <div className={cn("h-1.5 rounded-full transition-all",
                subscription.quotaWarning === 'exceeded' ? 'bg-red-500' :
                  subscription.quotaWarning === 'warning_90' ? 'bg-red-500' :
                    subscription.quotaWarning === 'warning_80' ? 'bg-amber-500' : 'bg-accent-primary'
              )} style={{ width: `${Math.min(100, subscription.monthlyUsagePercent)}%` }} />
            </div>
            <span className="text-[10px] text-text-muted whitespace-nowrap">
              {subscription.monthlyPromptsUsed}/{subscription.monthlyPromptLimit}
            </span>
          </div>
        )}

        {subscription && subscription.isTrialActive && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-secondary bg-accent-secondary/10 border border-accent-secondary/20 rounded-full backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" />
            {t.trialDays(subscription.trialDaysRemaining)}
          </span>
        )}

        {!isPaid && (
          <Link href="/pricing"
            className="group relative overflow-hidden flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full hover:shadow-lg hover:shadow-accent-primary/20 transition-all">
            <Crown className="w-3.5 h-3.5" />
            {t.upgrade}
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        {isPaid && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/30 text-accent-secondary rounded-full backdrop-blur-sm">
            <Crown className="w-3 h-3" /> {t.planNames[subscription?.plan || 'free']}
          </span>
        )}

        <ThemeToggle />
      </div>

      {/* ═══ Sidebar Navigation ═══ */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="relative z-30 justify-between gap-6 bg-background-secondary border-r border-white/5">
          {/* Top */}
          <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden flex-1">
            <SidebarLogo open={sidebarOpen} />

            <div className="h-px bg-white/5 my-1" />

            {/* Nav Links */}
            <SidebarLink
              link={{
                label: "Sohbet",
                href: "#",
                icon: <MessageSquare className="w-5 h-5 text-text-muted flex-shrink-0" />,
              }}
              className={cn("text-text-secondary hover:text-white transition-colors text-white bg-white/5 rounded-lg")}
              onClick={(e) => {
                e.preventDefault()
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
            />

            <SidebarLink
              link={{
                label: t.account,
                href: "/account",
                icon: <User className="w-5 h-5 text-text-muted flex-shrink-0" />,
              }}
              className="text-text-secondary hover:text-white transition-colors"
            />

            <SidebarLink
              link={{
                label: "Extension",
                href: "/extension",
                icon: <Puzzle className="w-5 h-5 text-text-muted flex-shrink-0" />,
              }}
              className="text-text-secondary hover:text-white transition-colors"
            />

            {/* History section inside sidebar */}
            {sidebarOpen && (
              <>
                <div className="h-px bg-white/5 my-1" />
                <div className="flex flex-col min-h-0 flex-1">
                  <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-1 mb-2">{t.recentHistory}</h4>
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
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-primary border border-accent-primary/20 uppercase">{item.category}</span>
                          <span className="text-[9px] text-text-muted">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-2 group-hover:text-text-primary transition-colors">{item.user_request}</p>
                      </div>
                    )) : (
                      <div className="flex flex-col items-center justify-center h-24 text-text-muted text-xs">
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
          (!result && !generating) ? "flex flex-col items-center justify-center" : ""
        )}>
          <div className={cn(
            "w-full max-w-4xl mx-auto",
            (!result && !generating) ? "text-center" : "py-10"
          )}>
            {!result && !generating && (
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-pink bg-clip-text text-transparent mb-3">
                  {t.heroTitle}
                </h2>
                <p className="text-text-muted text-sm max-w-md mx-auto">
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
                <GradientSpinner size={120} text="GENERATING" />
              </div>
            )}
          </div>
        </main>

        {/* Fixed Bottom Input Area - Always Visible for Chat */}
        <div className="w-full p-2 sm:p-4 z-40 shrink-0 bg-gradient-to-t from-background-primary via-background-primary/90 to-transparent pb-safe-area-inset-bottom">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSubmit={handleGenerate} isGenerating={generating} defaultCategory={lastCategory} />
          </div>
        </div>

      </div>
    </div>
  )
}

function SidebarLogo({ open }: { open: boolean }) {
  return (
    <div className="flex items-center gap-2 py-2 cursor-pointer">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      {open && (
        <motion.span
          animate={{ opacity: open ? 1 : 0, display: open ? "inline-block" : "none" }}
          className="text-lg font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent whitespace-nowrap"
        >
          AI Prompt App
        </motion.span>
      )}
    </div>
  )
}
