"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AletheiaLogo } from "../AletheiaLogo";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function LandingHeader() {
    const pathname = usePathname();
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (err) {
                console.error("Error fetching user session:", err);
            } finally {
                setLoading(false);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <header className="h-16 border-b border-border/10 bg-surface/90 backdrop-blur-3xl fixed top-0 left-0 right-0 z-50 px-8 flex items-center justify-between shadow-xl vibrant-indicator">
            <div className="flex items-center gap-8">
                {/* Brand Section */}
                <div className="flex items-center gap-3.5 group/header-brand">
                    <Link href="/" className="flex items-center gap-3.5">
                        <div className="p-1 px-2.5 bg-accent/10 rounded-lg border border-accent/30 shadow-lg shadow-accent/5 group-hover/header-brand:scale-110 transition-all duration-500">
                            <AletheiaLogo className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black tracking-[0.2em] text-lg text-gradient-vibrant uppercase hidden sm:block">Aletheia</span>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                                <span className="text-[8px] font-black tracking-widest text-accent uppercase">Stealth_LTD_Active</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-6 md:gap-8">
                <nav className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
                    <Link 
                        href="/dashboard/demo" 
                        className={`hover:text-accent transition-all ${
                            pathname === '/dashboard/demo'
                                ? 'text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] font-bold'
                                : 'text-text-secondary'
                        }`}
                    >
                        Demo
                    </Link>
                    <Link 
                        href="/features" 
                        className={`hover:text-accent transition-all ${
                            pathname === '/features'
                                ? 'text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] font-bold'
                                : 'text-text-secondary'
                        }`}
                    >
                        Features
                    </Link>
                    <Link 
                        href="/pricing" 
                        className={`hover:text-accent transition-all ${
                            pathname === '/pricing'
                                ? 'text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] font-bold'
                                : 'text-text-secondary'
                        }`}
                    >
                        Pricing
                    </Link>
                    {!loading && !user && (
                        <Link 
                            href="/auth/login" 
                            className={`hover:text-accent transition-all ${
                                pathname === '/auth/login'
                                    ? 'text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] font-bold'
                                    : 'text-text-secondary'
                            }`}
                        >
                            Sign_In
                        </Link>
                    )}
                </nav>

                <Link 
                    href="/dashboard" 
                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent-hover transition-all duration-300 border border-accent/20 px-4 py-2.5 rounded-xl bg-accent/5 shadow-lg shadow-accent/5 hover:scale-[1.02] active:scale-95"
                >
                    Dashboard
                </Link>
            </div>
        </header>
    );
}
