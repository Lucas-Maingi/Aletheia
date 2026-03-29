import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        const body = await req.json();
        const { content, type, version } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const feedback = await prisma.feedback.create({
            data: {
                content,
                type: type || 'general',
                version: version || '1.0.0',
                userId: user?.id || null, // Allow anonymous feedback if not logged in
            },
        });

        // Notify Admins about new feedback
        const admins = await prisma.user.findMany({
            where: { role: 'admin' },
            select: { id: true }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: 'New Feedback Received',
                    message: `New ${type || 'general'} feedback from ${user?.email || 'Anonymous'}: "${content.substring(0, 50)}..."`,
                    type: 'info'
                }))
            });
        }

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error('Feedback Submission Error:', error);
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
