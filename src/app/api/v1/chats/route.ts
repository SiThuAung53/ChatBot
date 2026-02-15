import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, unauthorized } from '@/lib/apiAuth';

// GET /api/v1/chats - List chats
export async function GET(req: NextRequest) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100);
  const status = req.nextUrl.searchParams.get('status');

  const where: any = {
    channel: { teamId: key.teamId },
  };
  if (status) {
    where.status = status.toUpperCase();
  }

  const [chats, total] = await Promise.all([
    prisma.chat.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        contact: { select: { id: true, name: true, platformId: true } },
        channel: { select: { type: true, name: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, direction: true, createdAt: true },
        },
      },
    }),
    prisma.chat.count({ where }),
  ]);

  return NextResponse.json({
    chats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
