import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { dispatchWebhook } from '@/lib/osint/webhook';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const user = await getEffectiveUserId();

    try {
        const body = await req.json();
        const { action, siemWebhookUrl, siemWebhookSecret } = body;

        // Save settings action
        if (action === 'save') {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    siemWebhookUrl: siemWebhookUrl || null,
                    siemWebhookSecret: siemWebhookSecret || null,
                }
            });
            return NextResponse.json({ success: true });
        }
        
        // Test webhook action
        if (action === 'test') {
            if (!siemWebhookUrl) {
                return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 });
            }

            await dispatchWebhook(siemWebhookUrl, siemWebhookSecret, {
                event: 'ping',
                timestamp: new Date().toISOString(),
                data: {
                    message: 'This is a test event from Aletheia OSINT Platform.',
                    status: 'success'
                }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('[Webhook Settings API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error?.message }, { status: 500 });
    }
}
