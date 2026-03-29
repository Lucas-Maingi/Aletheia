import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/feedback
 * Returns all feedback for admin review.
 */
export async function GET() {
    try {
        const user = await getEffectiveUserId();
        
        // Ensure the current user has admin rights
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        if (!dbUser || dbUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
        }

        const feedback = await prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            }
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('[ADMIN:FEEDBACK] Fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
