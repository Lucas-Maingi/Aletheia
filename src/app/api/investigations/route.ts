import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { sanitize, isSafeQuery } from '@/lib/security';

async function ensureUserExists(userId: string, email: string) {
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email },
    });
}

export async function GET() {
    const user = await getEffectiveUserId();

    try {
        await ensureUserExists(user.id, user.email);

        const investigations = await prisma.investigation.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { evidence: true, entities: true }
                }
            }
        });

        return NextResponse.json(investigations);
    } catch (error) {
        console.error('[API] Investigation list fetch failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await getEffectiveUserId();

    console.log(`[API] Creation request initiated by user: ${user.id}`);

    // Rate Limiting
    const limitKey = getRateLimitKey(user.id, 'create_investigation');
    const rateLimitResult = rateLimit(limitKey, { limit: 12, windowMs: 60000 });
    if (!rateLimitResult.success) {
        return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { title, description, subjectName, subjectUsername, subjectEmail, subjectPhone, subjectDomain, subjectImageUrl } = body;

        if (!title?.trim()) {
            return NextResponse.json({ error: 'Investigation title is required.' }, { status: 400 });
        }

        if (!isSafeQuery(title) || !isSafeQuery(description || '')) {
            return NextResponse.json({ error: 'Potentially malicious input detected.' }, { status: 400 });
        }

        // Ensure the user record exists
        console.log(`[API] Verifying user record in DB: ${user.id}`);
        await ensureUserExists(user.id, user.email);

        // Sanitize all inputs
        const safeData = {
            title: sanitize(title.trim()),
            description: description ? sanitize(description.trim()) : null,
            subjectName: subjectName ? sanitize(subjectName.trim()) : null,
            subjectUsername: subjectUsername ? sanitize(subjectUsername.trim()) : null,
            subjectEmail: subjectEmail ? sanitize(subjectEmail.trim()) : null,
            subjectPhone: subjectPhone ? sanitize(subjectPhone.trim()) : null,
            subjectDomain: subjectDomain ? sanitize(subjectDomain.trim()) : null,
            subjectImageUrl: subjectImageUrl && (subjectImageUrl.startsWith('data:') || subjectImageUrl.startsWith('http')) 
                ? subjectImageUrl.trim() 
                : (subjectImageUrl ? sanitize(subjectImageUrl.trim()) : null),
            userId: user.id,
        };

        console.log(`[API] Persisting investigation: "${safeData.title}"`);
        const investigation = await prisma.investigation.create({
            data: {
                ...safeData,
                status: 'pending'
            },
        });
        console.log(`[API] Investigation created as: ${investigation.id}`);

        return NextResponse.json(investigation, { status: 201 });
    } catch (error: any) {
        console.error('[API] Investigation creation failed:', error);
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
}
