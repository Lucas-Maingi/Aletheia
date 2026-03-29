import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

/**
 * PATCH /api/admin/feedback/[id]
 * Save admin reply and notify the user.
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getEffectiveUserId();
        
        // Admin verification
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        if (!dbUser || dbUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
        }

        const body = await request.json();
        const { replyContent, status } = body;

        const feedback = await prisma.feedback.update({
            where: { id },
            data: {
                replyContent,
                status: status || 'replied',
                adminId: user.id,
                updatedAt: new Date(),
            },
        });

        // Notify the user if original feedback was linked to a registered account
        if (feedback.userId) {
            await prisma.notification.create({
                data: {
                    userId: feedback.userId,
                    title: 'Feedback Response Received',
                    message: `The Aletheia team has responded to your feedback: "${replyContent.substring(0, 60)}..."`,
                    type: 'success'
                }
            });
        }

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error('[ADMIN:FEEDBACK:PATCH] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
