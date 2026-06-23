"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu, X, Home, PlusCircle, MessageSquare, User, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

export function MobileNav() {
    const pathname = usePathname();

    const tabs = [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
        { href: '/dashboard/investigations/new', label: 'New', icon: PlusCircle },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-1.5">
                {tabs.map(tab => {
                    const isActive = tab.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(tab.href);
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all active:scale-95 ${
                                isActive
                                    ? 'text-accent'
                                    : 'text-white/30 hover:text-white/50'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]' : ''}`} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export function MobileSidebarToggle({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("ale_sidebar_collapsed");
        if (stored === "true") {
            setIsCollapsed(true);
        }
        setIsMounted(true);
    }, []);

    const toggleSidebar = () => {
        const nextState = !isCollapsed;
        setIsCollapsed(nextState);
        localStorage.setItem("ale_sidebar_collapsed", String(nextState));
    };

    return (
        <>
            {/* Desktop: Collapsible Sidebar Wrapper */}
            {!isMounted ? (
                <div className="hidden md:flex w-64 h-full shrink-0">
                    {children}
                </div>
            ) : (
                <div className="relative flex h-full shrink-0 z-30">
                    <motion.div
                        animate={{ 
                            width: isCollapsed ? 0 : 256,
                            opacity: isCollapsed ? 0 : 1
                        }}
                        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                        className="hidden md:flex h-full overflow-hidden"
                    >
                        <div className="w-64 h-full shrink-0">
                            {children}
                        </div>
                    </motion.div>

                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex items-center justify-center absolute top-20 z-40 w-7 h-7 rounded-full bg-surface border border-border/20 text-text-secondary hover:text-text-primary hover:border-accent/40 hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
                        style={{
                            left: isCollapsed ? "12px" : "242px",
                            transition: "left 0.3s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s, border-color 0.2s"
                        }}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>
            )}

            {/* Mobile: Hamburger + slide-in */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden fixed top-3 left-3 z-[55] p-2.5 rounded-xl bg-surface/90 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white transition-colors shadow-lg"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-in Sidebar */}
            <div className={`md:hidden fixed inset-y-0 left-0 z-[70] w-72 transform transition-transform duration-300 ease-out ${
                open ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="h-full flex flex-col relative" onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a')) setOpen(false);
                }}>
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {children}
                </div>
            </div>
        </>
    );
}
