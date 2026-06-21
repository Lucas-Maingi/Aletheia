import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Zap, Palette, MessageSquare, Layers, Shield, Bell, Activity, LogOut, ArrowRight } from 'lucide-react';
import { AlertBell } from '@/components/dashboard/alert-bell';
import { AletheiaLogo } from '@/components/AletheiaLogo';
import { prisma } from '@/lib/prisma';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { FeedbackModal } from '@/components/dashboard/feedback-modal';
import { MobileNav, MobileSidebarToggle } from '@/components/dashboard/mobile-nav';
import { InvestigationProvider } from '@/context/InvestigationContext';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getEffectiveUserId();

    // Sync user with Prisma
    try {
        await prisma.user.upsert({
            where: { id: user.id },
            update: { email: user.email || '' },
            create: {
                id: user.id,
                email: user.email || '',
                role: user.isGuest ? 'guest' : 'analyst',
            }
        });

        // Background Identity Migration (Rescue for direct sign-ins)
        const cookieStore = await cookies();
        const guestId = cookieStore.get('ale_guest_id')?.value;
        
        if (!user.isGuest && guestId && guestId !== user.id) {
            console.log(`[Dashboard Rescue] Migrating data for ${user.email} from guest ${guestId}`);
            await prisma.$transaction([
                prisma.investigation.updateMany({
                    where: { userId: guestId },
                    data: { userId: user.id }
                }),
                prisma.searchLog.updateMany({
                    where: { userId: guestId },
                    data: { userId: user.id }
                })
            ]);
            // Clear cookie is handled in the next request or we can ignore it since guestId will match user.id or be skipped next time
        }
    } catch (error) {
        console.error('Prisma User Sync Error:', error);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
                <div className="p-8 bg-surface border border-danger/30 rounded-2xl max-w-md shadow-2xl">
                    <AletheiaLogo className="w-12 h-12 text-danger mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Database Connection Error</h1>
                    <p className="text-text-secondary text-sm mb-6">
                        Aletheia could not sync your session with the database. This usually happens if the database schema is not up to date or the connection string is incorrect.
                    </p>
                    <div className="p-4 bg-background/50 rounded-xl font-mono text-[10px] text-left mb-6 overflow-auto max-h-32">
                        {String(error)}
                    </div>
                </div>
            </div>
        );
    }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });
        const isAdmin = dbUser?.role === 'admin';

        return (
            <InvestigationProvider>
                <div className="flex flex-col h-screen overflow-hidden bg-background">
                    <DashboardHeader user={user} />
                    
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Navigation — hidden on mobile, shown via MobileSidebarToggle */}
                        <MobileSidebarToggle>
                            <aside className="w-64 bg-surface/80 backdrop-blur-2xl flex flex-col relative z-20 shadow-[10px_0_50px_rgba(0,0,0,0.3)] h-full overflow-hidden pt-16">
                                <nav className="flex-1 p-4 overflow-y-auto no-scrollbar border-r border-border/10 relative z-30 bg-surface/40">
                                    <SidebarNav isGuest={user.isGuest} isAdmin={isAdmin} />
                                </nav>

                            <div className="p-4 border-t border-r border-border/10 mt-auto bg-foreground/[0.04] backdrop-blur-3xl relative z-30 space-y-2">
                                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.05] text-text-tertiary hover:text-text-primary transition-all group/home border border-transparent hover:border-border/10">
                                    <Shield className="w-4 h-4 text-text-tertiary group-hover/home:text-accent transition-colors" />
                                    <span className="text-[11px] font-black uppercase tracking-widest flex-1">Site_Home</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover/home:opacity-100 transition-all translate-x-[-4px] group-hover/home:translate-x-0" />
                                </Link>
                                <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/[0.05] text-text-secondary hover:text-text-primary transition-all group/settings border border-transparent hover:border-border/10">
                                    <Palette className="w-4 h-4 text-text-tertiary group-hover/settings:text-accent transition-colors" />
                                    <span className="text-[11px] font-black uppercase tracking-widest flex-1">System_Config</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                                </Link>
                                <div className="pt-2 flex flex-wrap justify-between gap-x-2 gap-y-1.5 border-t border-border/10 text-[9px] font-bold text-text-tertiary uppercase tracking-wider relative z-30">
                                    <Link href="/about" className="hover:text-accent transition-colors">About</Link>
                                    <Link href="/ethics" className="hover:text-accent transition-colors">Ethics</Link>
                                    <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
                                    <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
                                </div>
                            </div>
                        </aside>
                    </MobileSidebarToggle>


                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto no-scrollbar relative bg-surface-2 flex flex-col pt-16">
                    <CommandPalette />

                    {/* Faded Background Grid to prevent harsh top line */}
                    <div 
                        className="absolute inset-0 pointer-events-none" 
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black)'
                        }} 
                    />

                    {user.isGuest && (
                        <div className="bg-accent/10 border-b border-accent/20 px-8 py-2 flex items-center justify-between relative z-20">
                            <div className="flex items-center gap-2 text-[11px] text-accent font-medium uppercase tracking-[0.2em]">
                                <Zap className="w-3 h-3 animate-pulse" />
                                Guest Session — Active Intelligence Sweep
                            </div>
                            <Link href="/auth/login" className="text-[10px] py-1 px-3 rounded-md bg-accent text-white font-bold hover:bg-accent/80 transition-colors uppercase tracking-widest">
                                Sign In to Save Investigations
                            </Link>
                        </div>
                    )}

                    <div className="px-4 md:px-8 pb-24 md:pb-8 max-w-[1400px] w-full mx-auto relative z-10 flex-1">
                        {children}
                    </div>
                </main>

                </div>

                <MobileNav />
            </div>
        </InvestigationProvider>
    );
}
