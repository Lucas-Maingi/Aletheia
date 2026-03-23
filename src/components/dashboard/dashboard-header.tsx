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
        <header className="h-16 border-b border-border/5 bg-surface/50 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-text-tertiary">
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1;
                    const path = `/${segments.slice(0, index + 1).join('/')}`;
                    const label = segment.replace(/-/g, '_');

                    return (
                        <div key={path} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="w-3 h-3 opacity-30" />}
                            {isLast ? (
                                <span className="text-accent neon-glow-cyan-sm">{label}</span>
                            ) : (
                                <Link href={path} className="hover:text-text-primary transition-colors">
                                    {label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                <div 
                    onClick={() => window.dispatchEvent(new CustomEvent('ale-toggle-command-palette'))}
                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-border/10 text-[9px] font-bold text-text-tertiary uppercase tracking-widest cursor-pointer hover:bg-foreground/[0.05] transition-all group/search"
                >
                    <Search className="w-3 h-3 group-hover/search:text-accent transition-colors" />
                    <span>Quick Search (⌘K)</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <AlertBell iconSize={18} className="p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10" />
                    <ThemeSwitcher iconOnly={true} align="bottom" side="right" />
                </div>
                
                <div className="h-4 w-px bg-border/10 hidden md:block" />
                
                <UserNav user={user} />
            </div>
        </header>
    );
}
