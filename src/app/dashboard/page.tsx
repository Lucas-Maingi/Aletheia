import { prisma } from '@/lib/prisma';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { getEffectiveUserId } from '@/lib/auth-utils';

export default async function DashboardPage() {
    const user = await getEffectiveUserId();

    // Fetch enhanced stats and recent investigations for Intelligence Hub v2
    let data;
    try {
        data = await Promise.all([
            prisma.investigation.findMany({
                where: { userId: user.id },
                orderBy: { updatedAt: 'desc' },
                take: 15
            }),
            prisma.investigation.count({
                where: { userId: user.id }
            }),
            prisma.evidence.count({
                where: { investigationId: { in: (await prisma.investigation.findMany({ where: { userId: user.id }, select: { id: true } })).map(i => i.id) } }
            }),
            prisma.investigation.count({
                where: { userId: user.id, status: { in: ['active', 'scanning'] } }
            }),
            prisma.evidence.findMany({
                where: { investigationId: { in: (await prisma.investigation.findMany({ where: { userId: user.id }, select: { id: true } })).map(i => i.id) } },
                orderBy: { createdAt: 'desc' },
                take: 8,
                include: { investigation: { select: { title: true } } }
            })
        ]);
    } catch (error) {
        console.error('Prisma Dashboard Fetch Error:', error);
        // Fallback for errors
        return (
            <div className="p-8 bg-surface border border-white/5 rounded-2xl text-center">
                <h2 className="text-lg font-bold mb-2">Tactical Link Offline</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Aletheia encountered a synchronization error while fetching your intelligence hub data.
                </p>
                <p className="text-[10px] font-mono mt-4 text-rose-400 opacity-70">{String(error)}</p>
            </div>
        );
    }

    const [rawInvestigations, totalInvestigations, signalYield, activeOps, recentDiscoveries] = data;

    // Map investigations with enhanced descriptors
    const investigations = rawInvestigations.map((inv: any) => ({
        id: inv.id,
        title: inv.title || inv.target || 'Unnamed Target',
        target: inv.subjectUsername || inv.target || 'N/A',
        status: (inv.status || 'ACTIVE').toUpperCase() === 'COMPLETED' || (inv.status || '').toLowerCase() === 'closed' ? 'Analyzed' : (inv.status || 'ACTIVE').toUpperCase() === 'FAILED' ? 'Critical' : 'Active',
        progress: (inv.status || 'ACTIVE').toUpperCase() === 'COMPLETED' || (inv.status || '').toLowerCase() === 'closed' ? 100 : Math.floor(Math.random() * 40 + 30),
        details: inv.description || `Automated digital footprint mapping in progress. Gathering intelligence points.`,
        leads: Math.floor(Math.random() * 20 + 2),
        source: inv.title?.startsWith('Chat:') ? 'chat' : 'dossier',
        updatedAt: inv.updatedAt
    }));

    return (
        <div className="animate-fade-in w-full h-full text-text-secondary">
            <DashboardClient 
                investigations={investigations} 
                totalInvestigations={totalInvestigations}
                signalYield={signalYield}
                activeOps={activeOps}
                recentDiscoveries={recentDiscoveries}
            />
        </div>
    );
}
