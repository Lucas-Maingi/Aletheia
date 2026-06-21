import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Unified Middleware
 * Handles:
 * 1. Supabase Auth Session Refresh
 * 2. Persistent Guest Identity (ale_guest_id)
 * 3. Route-based Access Control
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    // 1. Supabase Client Initialization (for Session Refresh)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data?.user || null;
    } catch (err) {
        console.warn('[Middleware] Supabase session check failed:', err);
    }

    // 2. Guest Identity Provisioning (Persistence Fix)
    const guestId = request.cookies.get('ale_guest_id')?.value;
    
    // Provisioning logic
    let effectiveGuestId = guestId;

    if (!user && !guestId) {
        effectiveGuestId = crypto.randomUUID();
        
        // 2.1 Set Cookie for the browser (Response)
        supabaseResponse.cookies.set('ale_guest_id', effectiveGuestId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });
    }

    // 2.2 Inject Header for the current request (API Routes)
    // CRITICAL: We create a NEW request object with updated headers to pass to NextResponse.next()
    if (effectiveGuestId) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-ale-guest-id', effectiveGuestId);
        
        // Re-initialize response with the modified request headers
        supabaseResponse = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
        
        // Re-apply the cookie if we just generated it
        if (!guestId && !user) {
            supabaseResponse.cookies.set('ale_guest_id', effectiveGuestId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            });
        }
    }

    // 3. Authorization & Access Control
    const { pathname } = request.nextUrl;
    
    // Public routes that don't require authentication
    const publicRoutes = [
        '/auth/login', 
        '/auth/signup', 
        '/auth/callback', 
        '/', 
        '/design-test', 
        '/dashboard', 
        '/investigations', 
        '/premium', 
        '/about', 
        '/documentation', 
        '/privacy', 
        '/terms', 
        '/faq', 
        '/blog',
        '/pricing',
        '/ethics',
        '/checkout',
        '/contact'
    ];
    
    const isPublicRoute = publicRoutes.some((route) => 
        pathname === route || 
        pathname.startsWith('/auth/') || 
        pathname.startsWith('/dashboard') || 
        pathname.startsWith('/api/') || 
        pathname.startsWith('/blog/')
    );

    if (!user && !isPublicRoute) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
