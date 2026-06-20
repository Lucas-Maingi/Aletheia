import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';

export async function GET() {
    try {
        const user = await getEffectiveUserId();
        const start = Date.now();
        // Check DB reachable
        const userCount = await prisma.user.count();
        
        // Ensure current session user exists
        const sessionUser = await prisma.user.upsert({
            where: { id: user.id },
            update: { updatedAt: new Date() },
            create: {
                id: user.id,
                email: user.email || 'guest@aletheia.io',
                role: user.isGuest ? 'guest' : 'analyst'
            }
        });
        
        const duration = Date.now() - start;
        
        // Fetch latest system activity
        const latestLogs = await prisma.searchLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { connectorType: true, query: true, createdAt: true, investigationId: true }
        });

        const latestEvidence = await prisma.evidence.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { title: true, type: true, createdAt: true, investigationId: true }
        });

        const counts = {
            users: userCount,
            logs: await prisma.searchLog.count(),
            evidence: await prisma.evidence.count(),
            investigations: await prisma.investigation.count()
        };
        
        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            counts,
            latestActivity: {
                logs: latestLogs,
                evidence: latestEvidence
            },
            guestStatus: sessionUser ? 'synchronized' : 'failed',
            latency: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        return NextResponse.json({
            status: 'degraded',
            database: 'unreachable',
            error: err.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
