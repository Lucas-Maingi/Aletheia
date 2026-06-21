"use client";

import { Shield, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export function LandingHeader() {
    const pathname = usePathname();
    const router = useRouter();

    const scrollToPricing = () => {
        const element = document.getElementById("pricing");
        element?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {pathname !== '/' && pathname !== '' && (
                        <button
                            onClick={() => router.back()}
                            className="group/back-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-primary text-xs font-semibold transition-all active:scale-95 hover:bg-surface-hover hover:border-border/80 shadow-md"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover/back-btn:-translate-x-0.5 transition-transform" />
                            <span>Back</span>
                        </button>
                    )}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Shield className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold tracking-tight text-text-primary">
                            Aletheia
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-6 md:gap-8">
                    <Link href="/pricing" className="hidden md:flex text-xs font-black uppercase tracking-widest text-text-secondary hover:text-accent transition-all duration-300">
                        Pricing
                    </Link>
                    <Link href="/auth/login" className="hidden md:flex text-xs font-black uppercase tracking-widest text-text-secondary hover:text-accent transition-all duration-300">
                        Sign_In
                    </Link>
                    <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-accent hover:text-accent-hover transition-all duration-300 border border-accent/20 px-4 py-2 rounded-lg bg-accent/5">
                        Dashboard
                    </Link>
                    <Link
                        href="https://github.com/Lucas-Maingi/OpenVector"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-text-tertiary hover:text-text-primary transition-colors hidden sm:block"
                        title="View on GitHub"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.841 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
}
