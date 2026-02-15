import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, unauthorized } from '@/lib/apiAuth';

// GET /api/v1/analytics - Get analytics data
export async function GET(req: NextRequest) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const period = req.nextUrl.searchParams.get('period') || '7d';
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalMessages, totalContacts, activeChats] = await Promise.all([
    prisma.message.count({
      where: {
        chat: { channel: { teamId: key.teamId } },
        createdAt: { gte: since },
      },
    }),
    prisma.contact.count({ where: { teamId: key.teamId } }),
    prisma.chat.count({
      where: {
        channel: { teamId: key.teamId },
        status: { in: ['OPEN', 'ASSIGNED'] },
      },
    }),
  ]);

  return NextResponse.json({
    totalMessages,
    totalContacts,
    activeChats,
    period,
  });
}
