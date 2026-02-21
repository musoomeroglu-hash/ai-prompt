import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    // Default to /categories if next not specified, or respect next if provided
    // Actually better to force /categories if we don't know the user preference
    const rawNext = requestUrl.searchParams.get('next') ?? '/categories'
    // Prevent open redirect: only allow internal paths starting with /
    const next = (rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : '/categories'

    if (code) {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        try {
                            cookieStore.set({ name, value, ...options })
                        } catch (error) {
                            // Cookie setting can fail in middleware
                            console.error('Error setting cookie:', error)
                        }
                    },
                    remove(name: string, options: any) {
                        try {
                            cookieStore.set({ name, value: '', ...options })
                        } catch (error) {
                            console.error('Error removing cookie:', error)
                        }
                    },
                },
            }
        )

        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth error:', error)
            return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`)
        }

        // Optional: Check if user has selected category in metadata
        // For now, we simply redirect to categories which will handle the flow
        // Or if we want to be smarter:
        const user = data.session?.user;
        if (user && !user.user_metadata?.selected_category) {
            return NextResponse.redirect(`${requestUrl.origin}/categories`)
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
