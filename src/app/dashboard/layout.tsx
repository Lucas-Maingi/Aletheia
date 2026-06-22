import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Zap, MessageSquare, Layers, Bell, Activity, LogOut } from 'lucide-react';
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
import { Footer } from '@/components/footer';
import { DashboardBackButton } from '@/components/dashboard/dashboard-back-button';
import { FloatingChat } from '@/components/dashboard/floating-chat';

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
        console.error('Prisma User Sync Error (Continuing with fallback):', error);
    }

    let isAdmin = false;
    let plan = 'free';
    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, plan: true }
        });
        isAdmin = dbUser?.role === 'admin';
        plan = dbUser?.plan || 'free';
    } catch (dbErr) {
        console.warn('[Layout] Database read failed, using defaults:', dbErr);
    }

        return (
            <InvestigationProvider>
                <div className="flex flex-col h-screen overflow-hidden bg-background">
                    <DashboardHeader user={user} />
                    
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Navigation — hidden on mobile, shown via MobileSidebarToggle */}
                        <MobileSidebarToggle>
                            <aside className="w-64 bg-surface/80 backdrop-blur-2xl flex flex-col relative z-20 shadow-[10px_0_50px_rgba(0,0,0,0.3)] h-full overflow-hidden pt-16">
                                <nav className="h-full pt-2 px-4 overflow-y-auto no-scrollbar border-r border-border/10 relative z-30 bg-surface/40">
                                    <SidebarNav isGuest={user.isGuest} isAdmin={isAdmin} plan={plan} userEmail={user.email} />
                                </nav>


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
                        <DashboardBackButton />
                        {children}
                    </div>

                    <Footer className="bg-surface/30 backdrop-blur-md border-t border-border/10 relative z-20" />
                </main>

                </div>

                <MobileNav />
                <FloatingChat />
            </div>
        </InvestigationProvider>
    );
}
