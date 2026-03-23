"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Layers, Shield, Zap, Search, Activity, ArrowUpRight } from "lucide-react";

interface NavLinkProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    isPrimary?: boolean;
}

function NavLink({ href, label, icon, badge, isPrimary }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 text-[11px] rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                    ? "text-text-primary bg-foreground/[0.06] dark:bg-foreground/[0.08] border-border/20 shadow-sm" 
                    : "text-text-secondary hover:text-text-primary border-transparent hover:bg-foreground/[0.03] dark:hover:bg-foreground/[0.05]"
            } border ${isPrimary ? "mb-4" : ""}`}
        >
            {/* Active Glow Indicator */}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-accent shadow-[0_0_10px_rgba(0,240,255,0.8)] rounded-full" />
            )}

            <div className={`transition-transform duration-500 ${isActive ? "text-accent scale-110" : "group-hover:text-accent group-hover:scale-110"}`}>
                {icon}
            </div>

            <span className={`tracking-tight font-black uppercase`}>
                {label}
            </span>

            {badge && (
                <span className={`ml-auto text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter transition-all ${
                    isActive 
                        ? "bg-accent/20 text-accent border border-accent/40" 
                        : "bg-foreground/[0.03] text-text-tertiary border border-border/10 group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/20 group-hover:opacity-100 opacity-60"
                }`}>
                    {badge}
                </span>
            )}
        </Link>
    );
}

export function SidebarNav({ isGuest }: { isGuest?: boolean }) {
    return (
        <div className="space-y-1 flex flex-col h-full">
            <div className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em] mb-4 mt-2 px-4">
                {isGuest ? 'Guest Session' : 'Main Navigation'}
            </div>

            <div className="space-y-0.5">
                <NavLink 
                    href="/dashboard" 
                    label="Dashboard Overview" 
                    icon={<Activity className="w-4 h-4" />} 
                />

                <Link
                    href="/dashboard/investigations/new"
                    className="flex items-center justify-between px-4 py-3 text-[11px] text-accent bg-accent/5 border border-accent/20 rounded-xl hover:bg-accent/10 transition-all duration-500 font-bold uppercase tracking-tight group relative overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:shadow-accent/30"
                >
                    <div className="flex items-center gap-2.5 relative z-10 overflow-hidden">
                        <Search className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Start New Investigation</span>
                    </div>
                    <span className="text-[7px] border border-accent/30 px-1.5 py-0.5 rounded bg-accent/20 text-accent animate-pulse relative z-10 shrink-0">NEW</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                </Link>

                <NavLink 
                    href="/dashboard/chat" 
                    label="AI Assistant" 
                    icon={<MessageSquare className="w-4 h-4" />} 
                />

                <NavLink 
                    href="/dashboard/investigations/batch" 
                    label="Bulk Processing" 
                    icon={<Layers className="w-4 h-4" />} 
                    badge="Elite"
                />

                <NavLink 
                    href="/dashboard/watchlists" 
                    label="Watchlists" 
                    icon={<Shield className="w-4 h-4" />} 
                    badge="Pro"
                />
            </div>

            <div className="mt-auto pt-10 pb-2">
                <Link
                    href="/premium"
                    className="relative flex flex-col p-5 rounded-2xl bg-surface border border-border/10 hover:border-accent/40 transition-all duration-500 group overflow-hidden shadow-2xl"
                >
                    {/* Interior Glow */}
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-all" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                                <Zap className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest border border-border/10 px-2 py-0.5 rounded-md">Plans & Pricing</span>
                        </div>
                        
                        <h4 className="text-[12px] font-bold text-text-primary uppercase tracking-widest mb-1.5">Go Premium</h4>
                        <p className="text-[10px] text-text-secondary leading-tight uppercase tracking-tight">
                            Unlock unrestricted social and financial data feeds.
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-accent uppercase tracking-widest group-hover:gap-3 transition-all duration-500">
                            Upgrade Now
                            <ArrowUpRight className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </Link>
            </div>
        </div>
    );
}
