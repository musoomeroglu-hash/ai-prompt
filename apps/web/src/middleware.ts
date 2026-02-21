import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public route'lar - kimlik doğrulama kontrolü YOK
    const publicPaths = [
        '/',
        '/auth',
        '/auth/callback',
        '/auth/error',
        '/pricing',
        '/about',
        '/terms',
        '/privacy',
    ]

    // Eğer public path ise, direkt geç
    const isPublicPath = publicPaths.some(path =>
        pathname === path || pathname.startsWith(path + '/')
    )

    if (isPublicPath) {
        return NextResponse.next()
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Kullanıcı durumunu kontrol et
    const { data: { user }, error } = await supabase.auth.getUser()

    // Korumalı route ve kullanıcı yoksa → ana sayfaya yönlendir
    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.searchParams.set('redirected', 'true')
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         * - API routes that don't need auth
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/generate).*)',
    ],
}
