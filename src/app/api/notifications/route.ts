import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getEffectiveUserId();
  
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const user = await getEffectiveUserId();
  const { id, isRead } = await req.json();

  if (id) {
    const updated = await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: isRead ?? true }
    });
    return NextResponse.json(updated);
  }

  // Mark all as read
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true }
  });

  return NextResponse.json({ success: true });
}
