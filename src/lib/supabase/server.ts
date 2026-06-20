import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Called from a Server Component - can be ignored
                    }
                },
            },
        }
    );

    // Development Bypass Link
    if (process.env.NODE_ENV === 'development') {
        const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
        supabase.auth.getUser = async () => {
            try {
                const res = await originalGetUser();
                if (res?.data?.user) return res;
            } catch (err) {
                console.warn('Supabase auth fetch failed, using local-dev-user fallback');
            }

            return {
                data: {
                    user: {
                        id: 'local-dev-user',
                        email: 'analyst@aletheia.io',
                        app_metadata: {},
                        user_metadata: {},
                        aud: 'authenticated',
                        created_at: new Date().toISOString()
                    } as any
                },
                error: null
            };
        };
    }

    return supabase;
}
