'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import tr, { type Dictionary } from '@/lib/locales/tr'
import en from '@/lib/locales/en'

export type Locale = 'tr' | 'en'

const dictionaries: Record<Locale, Dictionary> = { tr, en }

interface LanguageContextValue {
    locale: Locale
    t: Dictionary
    toggleLocale: () => void
    setLocale: (l: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue>({
    locale: 'tr',
    t: tr,
    toggleLocale: () => { },
    setLocale: () => { },
})

const STORAGE_KEY = 'app-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('tr')

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
        if (stored && dictionaries[stored]) {
            setLocaleState(stored)
        }
    }, [])

    const setLocale = (l: Locale) => {
        setLocaleState(l)
        localStorage.setItem(STORAGE_KEY, l)
    }

    const toggleLocale = () => {
        setLocale(locale === 'tr' ? 'en' : 'tr')
    }

    return (
        <LanguageContext.Provider value={{ locale, t: dictionaries[locale], toggleLocale, setLocale }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    return useContext(LanguageContext)
}
