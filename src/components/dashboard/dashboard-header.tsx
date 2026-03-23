"use client";

import { usePathname } from "next/navigation";
import { UserNav } from "./user-nav";
import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { AlertBell } from "./alert-bell";
import { ThemeSwitcher } from "../ui/theme-switcher";

interface DashboardHeaderProps {
    user: {
        id: string;
        email?: string;
        isGuest?: boolean;
    };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <header className="h-16 border-b border-border/10 bg-surface/60 backdrop-blur-2xl sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm vibrant-indicator">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-text-tertiary">
                {segments.filter(s => s.toLowerCase() !== 'dashboard').map((segment, index) => {
                    const isLast = index === segments.length - 1;
                    const path = `/${segments.slice(0, index + 1).join('/')}`;
                    const label = segment.replace(/-/g, ' ');

                    return (
                        <div key={path} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-20" />}
                            {isLast ? (
                                <span className="text-gradient-vibrant font-black">{label}</span>
                            ) : (
                                <Link href={path} className="hover:text-text-primary transition-all hover:tracking-[0.3em]">
                                    {label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                <div 
                    onClick={() => window.dispatchEvent(new CustomEvent('ale-toggle-command-palette'))}
                    className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/5 border border-accent/20 text-[9px] font-black text-accent uppercase tracking-widest cursor-pointer hover:bg-accent/10 hover:border-accent/40 hover:scale-[1.02] transition-all group/search shadow-lg shadow-accent/5"
                >
                    <Search className="w-3.5 h-3.5 group-hover/search:scale-110 transition-transform" />
                    <span>Quick Search</span>
                    <span className="opacity-40 ml-1">⌘K</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <AlertBell iconSize={18} className="p-2.5 rounded-xl hover:bg-accent/10 transition-all border border-transparent hover:border-accent/20 text-text-secondary hover:text-accent" />
                    <ThemeSwitcher iconOnly={true} align="bottom" side="right" />
                </div>
                
                <div className="h-6 w-px bg-border/20 hidden md:block" />
                
                <UserNav user={user} />
            </div>
        </header>
    );
}
