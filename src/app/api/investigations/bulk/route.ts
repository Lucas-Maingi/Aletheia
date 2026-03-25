import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    const user = await getEffectiveUserId();

    try {
        const body = await request.json();
        const { ids, action } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No investigation IDs provided' }, { status: 400 });
        }

        // 1. Verify ownership of ALL requested IDs
        const investigations = await prisma.investigation.findMany({
            where: {
                id: { in: ids },
                userId: user.id
            },
            select: { id: true }
        });

        if (investigations.length !== ids.length) {
            return NextResponse.json({ error: 'Unauthorized or invalid IDs in batch' }, { status: 403 });
        }

        const validIds = investigations.map(i => i.id);

        // 2. Perform requested action
        if (action === 'delete') {
            console.log(`[API] Bulk deleting ${validIds.length} investigations for user ${user.id}`);
            
            await prisma.$transaction([
                prisma.evidence.deleteMany({ where: { investigationId: { in: validIds } } }),
                prisma.report.deleteMany({ where: { investigationId: { in: validIds } } }),
                prisma.entity.deleteMany({ where: { investigationId: { in: validIds } } }),
                prisma.searchLog.deleteMany({ where: { investigationId: { in: validIds } } }),
                prisma.investigation.deleteMany({ where: { id: { in: validIds } } }),
            ]);

            revalidatePath('/dashboard/investigations');
            return new NextResponse(null, { status: 204 });
        } 
        
        if (action === 'archive' || action === 'close') {
            const status = action === 'archive' ? 'archived' : 'closed';
            console.log(`[API] Bulk updating ${validIds.length} investigations to ${status} for user ${user.id}`);
            
            await prisma.investigation.updateMany({
                where: { id: { in: validIds } },
                data: { status }
            });

            revalidatePath('/dashboard/investigations');
            return NextResponse.json({ success: true, count: validIds.length });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('[API] Bulk operation failed:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
