import { prisma } from './prisma';
import { createClient } from './supabase/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export const GUEST_ID_BASE = '';

/**
 * Gets the effective user ID for the current request.
 * Prioritizes Supabase Auth, then falls back to a session-bound Guest ID in cookies.
 */
export async function getEffectiveUserId(): Promise<{ id: string; email: string; isGuest: boolean }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        return { 
            id: user.id, 
            email: user.email || '', 
            isGuest: false 
        };
    }

    // Guest Mode: Check for a session cookie OR a middleware-injected header
    // We use a safe try-catch to avoid crashing if this is bundled for the client,
    // though this function is intended for server-side usage.
    let guestId: string | undefined;
    let headerGuestId: string | null = null;
    
    try {
        const cookieStore = await cookies();
        guestId = cookieStore.get('ale_guest_id')?.value;
        
        // In Next.js, the middleware can set headers on the request before it reaches the API route.
        const { headers } = await import('next/headers');
        const headerStore = await headers();
        headerGuestId = headerStore.get('x-ale-guest-id');
    } catch (e) {
        console.warn("[Auth] Identity check running in non-server context.");
    }

    const identity = guestId || headerGuestId || `temp-${randomUUID()}`;

    console.log(`[Auth] Unified Guest Identity: ${identity}`);

    return { 
        id: identity, 
        email: `${identity}@aletheia.io`, 
        isGuest: true 
    };
}

/**
 * Validates that the current user owns the specified investigation.
 * Throws an error or returns false if unauthorized.
 */
export async function validateOwnership(investigationId: string, userId: string): Promise<boolean> {
    try {
        const investigation = await prisma.investigation.findUnique({
            where: { id: investigationId },
            select: { userId: true }
        });

        if (!investigation) return false;
        return investigation.userId === userId;
    } catch (err) {
        console.error('[Security] Ownership validation failed:', err);
        return false;
    }
}
