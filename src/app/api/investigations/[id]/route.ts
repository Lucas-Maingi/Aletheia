import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId, validateOwnership } from '@/lib/auth-utils';
import { isValidUuid } from '@/lib/security';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getEffectiveUserId();
    const { id } = await params;

    if (!isValidUuid(id)) {
        return NextResponse.json({ error: 'Invalid identifier format' }, { status: 400 });
    }

    try {
        const investigation = await prisma.investigation.findUnique({
            where: { id },
            include: {
                entities: true,
                evidence: { orderBy: { createdAt: 'desc' }, take: 100 },
                reports: { orderBy: { createdAt: 'desc' }, take: 1 },
                logs: { orderBy: { createdAt: 'asc' }, take: 500 },
                parentInvestigation: { select: { id: true, title: true } },
                childInvestigations: { select: { id: true, title: true } },
                _count: { select: { evidence: true, entities: true } },
            }
        });

        if (!investigation) {
            return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
        }

        // STRICT OWNERSHIP CHECK
        if (investigation.userId !== user.id) {
            console.warn(`[Security] Unauthorized access attempt by ${user.id} on ${id}`);
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json(investigation, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            }
        });
    } catch (error) {
        console.error('[API] Investigation fetch failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
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

        const body = await request.json();
        // Explicitly pick only allowed update fields (prevents injection of userId/id overrides)
        const {
            title, description, status, subjectName, subjectUsername,
            subjectEmail, subjectPhone, subjectDomain, subjectImageUrl,
            // Case management fields
            notes, tags, isShared, shareToken
        } = body;

        const updateData: Record<string, any> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (subjectName !== undefined) updateData.subjectName = subjectName;
        if (subjectUsername !== undefined) updateData.subjectUsername = subjectUsername;
        if (subjectEmail !== undefined) updateData.subjectEmail = subjectEmail;
        if (subjectPhone !== undefined) updateData.subjectPhone = subjectPhone;
        if (subjectDomain !== undefined) updateData.subjectDomain = subjectDomain;
        if (subjectImageUrl !== undefined) updateData.subjectImageUrl = subjectImageUrl;
        if (notes !== undefined) updateData.notes = notes;
        if (tags !== undefined) updateData.tags = tags;
        if (isShared !== undefined) updateData.isShared = isShared;
        if (shareToken !== undefined) updateData.shareToken = shareToken;

        const investigation = await prisma.investigation.update({
            where: { id },
            data: updateData,
        });

        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/investigations/${id}`);

        return NextResponse.json(investigation);
    } catch (error) {
        console.error('[API] Investigation update failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
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
            console.warn(`[Security] Unauthorized deletion attempt by ${user.id} on ${id}`);
            return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 403 });
        }

        console.log(`[API] Deleting investigation ${id} for user ${user.id}`);

        // Atomic cleanup of all intelligence artifacts
        await prisma.$transaction([
            prisma.evidence.deleteMany({ where: { investigationId: id } }),
            prisma.report.deleteMany({ where: { investigationId: id } }),
            prisma.entity.deleteMany({ where: { investigationId: id } }),
            prisma.searchLog.deleteMany({ where: { investigationId: id } }),
            prisma.investigation.delete({ where: { id } }),
        ]);

        console.log(`[API] Successfully deleted investigation ${id}`);

        // Forced Cache Revalidation
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/investigations');

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[API] Investigation deletion failed:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
