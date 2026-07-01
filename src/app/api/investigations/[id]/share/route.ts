import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId, validateOwnership } from '@/lib/auth-utils';
import { isValidUuid } from '@/lib/security';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// POST /api/investigations/[id]/share
// Body: { enable: boolean }
// Enables or disables public sharing for an investigation.
// If enabling and no token exists, generates a new UUID shareToken.
// If disabling, clears the shareToken and sets isShared=false.
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getEffectiveUserId();
    const { id } = await params;

    if (!isValidUuid(id)) {
        return NextResponse.json({ error: 'Invalid identifier format' }, { status: 400 });
    }

    try {
        const isOwner = await validateOwnership(id, user.id);
        if (!isOwner) {
            return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
        }

        const { enable } = await req.json();

        if (enable) {
            // Fetch current shareToken to avoid re-generating (idempotent)
            const current = await prisma.investigation.findUnique({
                where: { id },
                select: { shareToken: true },
            });

            const shareToken = current?.shareToken || randomUUID();

            const updated = await prisma.investigation.update({
                where: { id },
                data: { isShared: true, shareToken },
                select: { isShared: true, shareToken: true },
            });

            revalidatePath(`/dashboard/investigations/${id}`);

            return NextResponse.json({
                isShared: updated.isShared,
                shareToken: updated.shareToken,
                shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/investigations/${updated.shareToken}`,
            });
        } else {
            const updated = await prisma.investigation.update({
                where: { id },
                data: { isShared: false, shareToken: null },
                select: { isShared: true, shareToken: true },
            });

            revalidatePath(`/dashboard/investigations/${id}`);

            return NextResponse.json({ isShared: false, shareToken: null });
        }
    } catch (error: any) {
        console.error('[Share API] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error?.message }, { status: 500 });
    }
}
