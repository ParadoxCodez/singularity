import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // If user is not signed in and tries to access protected routes → redirect to /auth
    if (!user && request.nextUrl.pathname.startsWith('/habits')) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }
    if (!user && request.nextUrl.pathname.startsWith('/journal')) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }
    if (!user && request.nextUrl.pathname.startsWith('/spending')) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }
    if (!user && request.nextUrl.pathname.startsWith('/analytics')) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }
    if (!user && request.nextUrl.pathname.startsWith('/settings')) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    // If user IS signed in and visits /auth or / → redirect to /habits
    if (user && request.nextUrl.pathname === '/auth') {
        return NextResponse.redirect(new URL('/habits', request.url))
    }
    if (user && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/habits', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/', '/auth', '/habits/:path*', '/journal/:path*', '/spending/:path*', '/analytics/:path*', '/settings/:path*'],
}
