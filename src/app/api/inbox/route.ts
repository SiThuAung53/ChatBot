import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chats = await prisma.chat.findMany({
    where: {
      channel: { teamId: session.user.teamId },
    },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          platformId: true,
          avatarUrl: true,
        },
      },
      channel: {
        select: { type: true, name: true },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(chats);
}
