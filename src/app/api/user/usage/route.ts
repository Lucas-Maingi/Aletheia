import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';

export async function GET() {
    try {
        const { id: userId, isGuest } = await getEffectiveUserId();
        
        if (isGuest) {
            return NextResponse.json({
                plan: 'anonymous',
                investigationsCount: 0,
                facialAiCredits: 0,
                investigationsLimit: 0,
                isGuest: true
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                plan: true,
                investigationsCount: true,
                facialAiCredits: true,
                name: true,
                avatarUrl: true,
                email: true,
                siemWebhookUrl: true,
                siemWebhookSecret: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Tier limits mapping
        const limits: Record<string, { investigations: number; facial: number }> = {
            free: { investigations: 15, facial: 5 },
            pro: { investigations: 100, facial: 50 },
            command: { investigations: 500, facial: 250 },
            agency: { investigations: 2000, facial: 1000 },
        };

        const currentLimits = limits[user.plan] || limits.free;

        return NextResponse.json({
            ...user,
            investigationsLimit: currentLimits.investigations,
            facialLimit: currentLimits.facial,
            isGuest: false
        });
    } catch (error: any) {
        console.error('[API User Usage] Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
    }
}
