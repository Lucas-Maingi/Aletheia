import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { sendEmail } from '@/lib/email';
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
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        // Determine recipient email
        const targetEmail = feedback.email || feedback.user?.email;

        if (replyContent && targetEmail) {
            const clientName = feedback.name || feedback.user?.name || "Operative";
            const replyEmailHtml = `
                <div style="font-family: monospace; background-color: #020617; color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
                    <h2 style="color: #00f0ff; border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em;">
                        [Aletheia Support Nexus] message from command
                    </h2>
                    
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                        Hello ${clientName},
                    </p>
                    
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                        Our operations team has reviewed your support/feedback submission and dispatched a response.
                    </p>
                    
                    <div style="margin: 20px 0; padding: 15px; border-left: 3px solid #00f0ff; background-color: #0b1329; border-radius: 4px; color: #94a3b8; font-style: italic; font-size: 13px;">
                        "${feedback.content}"
                    </div>

                    <div style="margin: 25px 0; padding: 20px; background-color: #0d1e3d; border-radius: 8px; border: 1px solid rgba(0, 240, 255, 0.2); color: #f8fafc; line-height: 1.6; font-size: 13px; font-weight: bold; white-space: pre-wrap;">
${replyContent}
                    </div>
                    
                    <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
                        This is an automated dispatch. You can reply directly to this email if you require further assistance.
                    </p>

                    <div style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px; font-size: 10px; color: #64748b; text-align: center;">
                        Aletheia Intelligence Command Center • Stealth Active
                    </div>
                </div>
            `;

            await sendEmail({
                to: targetEmail,
                subject: `Re: [Aletheia Support] Response to your feedback / request`,
                html: replyEmailHtml
            });
        }

        // Notify the user if original feedback was linked to a registered account
        if (feedback.userId && replyContent) {
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
