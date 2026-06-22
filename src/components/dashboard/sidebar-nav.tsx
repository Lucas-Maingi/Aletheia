"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    MessageSquare, Layers, Shield, Zap, Search, 
    Activity, ArrowUpRight, LayoutDashboard, Database, Lock,
    AlertTriangle, Loader2, CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface NavLinkProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    isPrimary?: boolean;
    isLocked?: boolean;
}

function NavLink({ href, label, icon, badge, isPrimary, isLocked }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 text-[12px] rounded-xl transition-all duration-300 group relative overflow-hidden ${
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

            <span className={`tracking-widest font-black uppercase text-[11px] ${isActive ? "text-text-primary" : "text-text-tertiary group-hover:text-text-primary"}`}>
                {label}
            </span>

            {badge && (
                <span className={`ml-auto flex items-center gap-1 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter transition-all ${
                    isActive 
                        ? "bg-accent text-white border border-accent shadow-[0_0_8px_rgba(0,240,255,0.4)]" 
                        : "bg-foreground/[0.06] text-text-secondary border border-border/10 group-hover:bg-accent/10 group-hover:text-accent opacity-100"
                }`}>
                    {isLocked && <Lock className="w-2 h-2 text-current shrink-0" />}
                    {badge}
                </span>
            )}
        </Link>
    );
}

export function SidebarNav({ 
    isGuest, 
    isAdmin, 
    plan = "free",
    userEmail
}: { 
    isGuest?: boolean; 
    isAdmin?: boolean; 
    plan?: string;
    userEmail?: string;
}) {
    // Determine locked states
    const isWatchlistLocked = plan === "free";
    const isBulkLocked = plan === "free" || plan === "pro";

    return (
        <div className="space-y-4 flex flex-col min-h-full">
            {/* Admin Section */}
            {isAdmin && (
                <div className="space-y-1">
                    <div className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.4em] mb-2 px-4 border-l-2 border-accent/10 ml-1">
                        Admin_Ops
                    </div>
                    <NavLink 
                        href="/dashboard/admin/feedback" 
                        label="Admin Terminal" 
                        icon={<Activity className="w-4 h-4" />} 
                    />
                </div>
            )}

            {/* Mission Control Section */}
            <div className="space-y-1">
                <div className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.4em] mb-2 px-4 border-l-2 border-accent/10 ml-1">
                    {isGuest ? 'Anonymous_Session' : 'Mission_Control'}
                </div>

                <NavLink 
                    href="/dashboard" 
                    label="Dashboard Overview" 
                    icon={<LayoutDashboard className="w-4 h-4" />} 
                />

                <Link
                    href="/dashboard/investigations/new"
                    className="flex items-center justify-between px-4 py-3 mt-1.5 mb-2.5 text-[12px] text-white bg-accent border border-accent shadow-xl shadow-accent/20 rounded-xl hover:bg-accent-hover hover:scale-[1.02] transition-all duration-300 font-black uppercase tracking-widest group relative overflow-hidden"
                >
                    <div className="flex items-center gap-2.5 relative z-10 overflow-hidden">
                        <Search className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Start Investigation</span>
                    </div>
                    <span className="text-[9px] border border-white/20 px-2 py-0.5 rounded bg-white/10 text-white animate-pulse relative z-10 shrink-0">INTEL</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                </Link>

                <NavLink 
                    href="/dashboard/investigations" 
                    label="Intelligence Archive" 
                    icon={<Database className="w-4 h-4" />} 
                />
            </div>

            {/* Automated Systems Section */}
            <div className="space-y-1">
                <div className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.4em] mb-2 mt-4 px-4 border-l-2 border-accent/10 ml-1">
                    Automated_Recon
                </div>

                <NavLink 
                    href="/dashboard/investigations/batch" 
                    label="Bulk Processing" 
                    icon={<Layers className="w-4 h-4" />} 
                    badge="Elite"
                    isLocked={isBulkLocked}
                />

                <NavLink 
                    href="/dashboard/watchlists" 
                    label="Watchlists" 
                    icon={<Shield className="w-4 h-4" />} 
                    badge="Pro"
                    isLocked={isWatchlistLocked}
                />
            </div>

            {/* Call to Action Upgrade Box */}
            {(plan === "free" || plan === "pro") && (
                <div className="pt-4 pb-1">
                    <Link
                        href="/pricing"
                        className="relative flex flex-col p-5 rounded-3xl bg-surface/50 backdrop-blur-3xl border border-accent/20 dark:border-white/5 hover:border-accent/40 shadow-xl transition-all duration-500 group overflow-hidden"
                    >
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-all" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                                <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
                                    <Zap className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em] border border-accent/20 px-2.5 py-1 rounded-lg bg-accent/5">
                                    {plan === "free" ? "Upgrade" : "Go Elite"}
                                </span>
                            </div>
                            
                            <h4 className="text-[13px] font-black text-text-primary uppercase tracking-widest mb-2">Go Premium</h4>
                            <p className="text-[11px] text-text-tertiary leading-relaxed uppercase tracking-tight">
                                Access unfiltered Intelligence nodes & data feeds.
                            </p>

                            <div className="mt-5 flex items-center gap-2.5 text-[11px] font-black text-accent uppercase tracking-widest group-hover:gap-4 transition-all duration-500">
                                Upgrade Profile
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* System Utilities Section */}
            <div className="mt-auto pt-6 border-t border-border/10 space-y-4 shrink-0">
                <div className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.4em] px-4 border-l-2 border-accent/10 ml-1">
                    System_Utilities
                </div>

                <div className="px-1">
                    <ThemeSwitcher 
                        align="top" 
                        side="left" 
                        dropdownClassName="w-[224px] left-0 right-0" 
                        className="w-full justify-start p-2 px-4 rounded-xl border border-border/10 hover:border-accent/30 bg-surface/50 text-[11px] font-black uppercase tracking-widest text-text-secondary hover:text-accent transition-all duration-300" 
                    />
                </div>

                <div className="px-1">
                    <SidebarFeedbackWidget isGuest={isGuest} userEmail={userEmail} />
                </div>
            </div>

            {/* Physical spacer element to bypass browser scrollHeight padding bugs */}
            <div className="h-16 shrink-0" />
        </div>
    );
}

function SidebarFeedbackWidget({ isGuest, userEmail }: { isGuest?: boolean, userEmail?: string }) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'complaint' | 'feature' | 'review'>('complaint');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const apiType = activeTab === 'complaint' 
                ? 'bug' 
                : activeTab === 'feature' 
                ? 'feature' 
                : 'general';

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content,
                    type: apiType,
                    version: '1.2.0',
                    name: isGuest ? (name || 'Anonymous') : null,
                    email: isGuest ? (email || 'Anonymous') : null
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitSuccess(true);
                setContent('');
                setName('');
                setEmail('');
                setTimeout(() => {
                    setSubmitSuccess(false);
                    setOpen(false); // Auto-close popup on success
                }, 2000);
            } else {
                setError(data.error || 'Failed to submit feedback');
            }
        } catch (err) {
            console.error('Feedback error:', err);
            setError('Connection failed. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const TABS = [
        { id: 'complaint', label: 'Complains', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        { id: 'feature', label: 'Feature', icon: <Zap className="w-3.5 h-3.5" /> },
        { id: 'review', label: 'Review', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    ] as const;

    return (
        <div className="relative w-full">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                    open 
                        ? 'border-accent text-accent bg-accent/5' 
                        : 'border-border/10 hover:border-accent/30 bg-surface/50 text-text-secondary hover:text-accent'
                } text-[11px] font-black uppercase tracking-widest`}
            >
                <MessageSquare className="w-4 h-4 text-accent" />
                <span>Submit Feedback</span>
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Pop-up Form Container */}
                    <form 
                        onSubmit={handleSubmit} 
                        className="absolute bottom-full mb-3 left-0 right-0 w-[224px] bg-surface/95 backdrop-blur-3xl border border-border/10 rounded-2xl p-4 space-y-3 shadow-2xl z-50 overflow-hidden animate-scale-in"
                    >
                        <h5 className="text-[10px] font-black text-text-primary uppercase tracking-widest flex items-center gap-1.5 border-b border-border/5 pb-2">
                            <MessageSquare className="w-3 h-3 text-accent" />
                            Submit Feedback
                        </h5>

                        <div className="grid grid-cols-3 gap-1 bg-foreground/[0.03] p-1 rounded-xl border border-border/5">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm'
                                            : 'text-text-tertiary hover:text-text-secondary border border-transparent'
                                    } border`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {submitSuccess ? (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest text-center rounded-xl animate-fade-in flex flex-col items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                                <span>Feedback Saved</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {!isGuest && userEmail ? (
                                    <div className="text-[9px] text-text-tertiary uppercase font-mono tracking-wider bg-foreground/[0.02] border border-border/5 p-2 rounded-lg truncate">
                                        Signed in: <span className="text-text-secondary font-bold">{userEmail}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-background/50 border border-border/10 rounded-xl px-3 py-2 text-[10px] text-text-primary focus:outline-none focus:border-accent/40 placeholder:text-text-tertiary font-mono"
                                            required
                                        />
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-background/50 border border-border/10 rounded-xl px-3 py-2 text-[10px] text-text-primary focus:outline-none focus:border-accent/40 placeholder:text-text-tertiary font-mono"
                                            required
                                        />
                                    </div>
                                )}

                                <textarea
                                    placeholder={
                                        activeTab === 'complaint'
                                            ? "What issue did you encounter?"
                                            : activeTab === 'feature'
                                            ? "What should we build next?"
                                            : "Write your review..."
                                    }
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full bg-background/50 border border-border/10 rounded-xl px-3 py-2 text-[10px] text-text-primary focus:outline-none focus:border-accent/40 placeholder:text-text-tertiary resize-none h-16 font-mono"
                                    required
                                />

                                {error && (
                                    <div className="text-[9px] text-danger font-bold uppercase tracking-wider font-mono">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !content.trim()}
                                    className="w-full h-8 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-accent hover:bg-accent-hover disabled:bg-foreground/[0.04] disabled:text-text-tertiary border border-accent/20 rounded-xl transition-all duration-300 active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <span>Submit Feedback</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </>
            )}
        </div>
    );
}
