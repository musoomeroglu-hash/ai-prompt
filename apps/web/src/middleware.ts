import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabaseServer'

export async function middleware(request: NextRequest) {
    const { response, user } = await updateSession(request)

    // Define public paths that don't require auth
    const publicPaths = ['/login', '/auth', '/pricing', '/debug']
    if (process.env.NODE_ENV === 'development') {
        publicPaths.push('/')
    }
    const isPublic = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (!user && !isPublic) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', 'middleware_unauthenticated')
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
