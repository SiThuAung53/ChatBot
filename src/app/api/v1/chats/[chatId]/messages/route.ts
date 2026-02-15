import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, unauthorized } from '@/lib/apiAuth';
import { sendPlatformMessage } from '@/lib/messaging';

// GET /api/v1/chats/:chatId/messages - Get messages
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50'), 100);

  const chat = await prisma.chat.findFirst({
    where: {
      id: params.chatId,
      channel: { teamId: key.teamId },
    },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { chatId: params.chatId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.count({ where: { chatId: params.chatId } }),
  ]);

  return NextResponse.json({
    messages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/v1/chats/:chatId/messages - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const { content, type = 'TEXT' } = await req.json();

  const chat = await prisma.chat.findFirst({
    where: {
      id: params.chatId,
      channel: { teamId: key.teamId },
    },
    include: { contact: true, channel: true },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  // Store message
  const message = await prisma.message.create({
    data: {
      chatId: params.chatId,
      direction: 'OUTGOING',
      type: type as any,
      content,
    },
  });

  // Send to platform
  await sendPlatformMessage(chat.channel, chat.contact.platformId, content, type);

  return NextResponse.json(message);
}
