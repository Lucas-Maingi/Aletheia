"use client";

import { usePathname, useRouter } from "next/navigation";
import { UserNav } from "./user-nav";
import { ChevronRight, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AlertBell } from "./alert-bell";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AletheiaLogo } from "../AletheiaLogo";

interface DashboardHeaderProps {
    user: {
        id: string;
        email?: string;
        isGuest?: boolean;
    };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const segments = pathname.split('/').filter(Boolean);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show header when scrolling up or at the very top (wider threshold)
            if (currentScrollY < lastScrollY || currentScrollY < 40) {
                setIsVisible(true);
            } 
            // Hide header when scrolling down and past a meaningful offset
            else if (currentScrollY > 120 && currentScrollY > lastScrollY) {
                setIsVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <AnimatePresence>
            <motion.header 
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : -100 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="h-16 border-b border-border/10 bg-surface/90 backdrop-blur-3xl fixed top-0 left-0 right-0 z-50 px-8 flex items-center justify-between shadow-xl vibrant-indicator"
            >
                {/* Unified Branding & Breadcrumbs */}
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

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    {/* Public Drop Nav */}
                    <nav className="hidden xl:flex items-center gap-8 mr-2 text-[10px] font-black uppercase tracking-widest">
                        <Link 
                            href="/dashboard/demo" 
                            className={`hover:text-accent transition-all ${
                                pathname === '/dashboard/demo' 
                                    ? 'text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] font-bold' 
                                    : 'text-text-tertiary'
                            }`}
                        >
                            Demo
                        </Link>
                        <Link 
                            href="/features" 
                            className={`hover:text-accent transition-all ${
                                pathname === '/features' 
                                    ? 'text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] font-bold' 
                                    : 'text-text-tertiary'
                            }`}
                        >
                            Features
                        </Link>
                        <Link 
                            href="/pricing" 
                            className={`hover:text-accent transition-all ${
                                pathname === '/pricing' 
                                    ? 'text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] font-bold' 
                                    : 'text-text-tertiary'
                            }`}
                        >
                            Pricing
                        </Link>
                    </nav>

                    <div 
                        onClick={() => window.dispatchEvent(new CustomEvent('ale-toggle-command-palette'))}
                        className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-accent/5 border border-accent/20 text-[11px] font-black text-accent uppercase tracking-widest cursor-pointer hover:bg-accent/10 hover:border-accent/40 hover:scale-[1.02] transition-all group/search shadow-lg shadow-accent/5"
                    >
                        <Search className="w-4 h-4 group-hover/search:scale-110 transition-transform" />
                        <span>Quick Search</span>
                        <span className="opacity-40 ml-1">⌘K</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <AlertBell iconSize={20} className="p-2.5 rounded-xl hover:bg-accent/10 transition-all border border-transparent hover:border-accent/20 text-text-secondary hover:text-accent" />
                    </div>
                    
                    <div className="h-6 w-px bg-border/20 hidden md:block" />
                    
                    <UserNav user={user} />
                </div>
            </motion.header>
        </AnimatePresence>
    );
}
