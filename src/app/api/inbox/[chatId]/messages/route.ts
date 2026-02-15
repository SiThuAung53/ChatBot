import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendPlatformMessage } from '@/lib/messaging';

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { chatId: params.chatId },
    include: {
      sender: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content } = await req.json();

  const chat = await prisma.chat.findFirst({
    where: { id: params.chatId },
    include: {
      contact: true,
      channel: true,
    },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  // Store message
  const message = await prisma.message.create({
    data: {
      chatId: params.chatId,
      senderId: session.user.id,
      direction: 'OUTGOING',
      type: 'TEXT',
      content,
    },
    include: {
      sender: { select: { name: true } },
    },
  });

  // Send to platform
  await sendPlatformMessage(
    chat.channel,
    chat.contact.platformId,
    content,
    'TEXT',
    chat.channel.type === 'TELEGRAM'
      ? { chatId: chat.contact.platformId }
      : undefined
  );

  // Track analytics
  await prisma.analyticsEvent.create({
    data: {
      contactId: chat.contact.id,
      eventType: 'message_sent',
      channel: chat.channel.type,
    },
  });

  return NextResponse.json(message);
}
