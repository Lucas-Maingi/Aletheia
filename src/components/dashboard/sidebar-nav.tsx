"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Layers, Shield, Zap, Search, Activity, ArrowUpRight, LayoutDashboard } from "lucide-react";

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
                    ? "text-text-primary bg-accent/5 border-accent/20 shadow-[0_0_20px_rgba(0,240,255,0.08)]" 
                    : "text-text-secondary hover:text-text-primary border-transparent hover:bg-foreground/[0.04] dark:hover:bg-white/[0.02] hover:border-accent/10 hover:shadow-lg hover:shadow-accent/[0.02]"
            } border active:scale-[0.98] active:brightness-110 ${isPrimary ? "mb-4" : ""}`}
        >
            {/* Active Glow Indicator */}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent shadow-[0_0_15px_var(--accent)] rounded-full" />
            )}

            <div className={`transition-all duration-500 ${isActive ? "text-accent scale-110 drop-shadow-[0_0_12px_rgba(0,240,255,0.5)]" : "text-text-tertiary group-hover:text-accent group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]"}`}>
                {icon}
            </div>

            <span className={`tracking-widest font-black uppercase text-[10px] ${isActive ? "text-text-primary" : "text-text-tertiary group-hover:text-text-primary"}`}>
                {label}
            </span>

            {badge && (
                <span className={`ml-auto text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter transition-all ${
                    isActive 
                        ? "bg-accent text-white border border-accent shadow-[0_0_8px_rgba(0,240,255,0.4)]" 
                        : "bg-foreground/[0.06] text-text-secondary border border-border/10 group-hover:bg-accent/10 group-hover:text-accent opacity-100"
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
            <div className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.4em] mb-2 mt-2 px-4 border-l-2 border-accent/10 ml-1">
                {isGuest ? 'Anonymous_Session' : 'Mission_Operations'}
            </div>

            <div className="space-y-0.5">
                <NavLink 
                    href="/dashboard" 
                    label="Dashboard Overview" 
                    icon={<LayoutDashboard className="w-4 h-4" />} 
                />

                <Link
                    href="/dashboard/investigations/new"
                    className="flex items-center justify-between px-4 py-3 mt-1.5 mb-4 text-[11px] text-white bg-accent border border-accent shadow-xl shadow-accent/20 rounded-xl hover:bg-accent-hover hover:scale-[1.02] transition-all duration-300 font-black uppercase tracking-widest group relative overflow-hidden"
                >
                    <div className="flex items-center gap-2.5 relative z-10 overflow-hidden">
                        <Search className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Start Investigation</span>
                    </div>
                    <span className="text-[8px] border border-white/20 px-2 py-0.5 rounded bg-white/10 text-white animate-pulse relative z-10 shrink-0">INTEL</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
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

            <div className="mt-auto pt-4 pb-1">
                <Link
                    href="/premium"
                    className="relative flex flex-col p-4 rounded-2xl bg-accent/5 dark:bg-slate-900 border border-accent/20 dark:border-white/10 hover:border-accent shadow-2xl transition-all duration-500 group overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent/20 blur-2xl group-hover:bg-accent/30 transition-all" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                                <Zap className="w-4 h-4 text-accent" />
                            </div>
                            <span className="text-[8px] font-black text-accent dark:text-white uppercase tracking-widest border border-accent/20 dark:border-white/10 px-2 py-0.5 rounded-md bg-accent/5 dark:bg-white/5">Elite_Tier</span>
                        </div>
                        
                        <h4 className="text-[12px] font-black text-text-primary dark:text-white uppercase tracking-widest mb-1">Go Premium</h4>
                        <p className="text-[10px] text-text-tertiary dark:text-slate-400 leading-tight uppercase tracking-tight">
                            Access unfiltered Intelligence nodes & data feeds.
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest group-hover:gap-3 transition-all duration-500">
                            Upgrade Profile
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
