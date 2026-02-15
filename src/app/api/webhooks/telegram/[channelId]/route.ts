import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processIncomingMessage } from '@/lib/messaging';

export async function POST(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const body = await req.json();

    const channel = await prisma.channel.findFirst({
      where: { id: params.channelId, type: 'TELEGRAM' },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const message = body.message || body.callback_query?.message;
    const callbackData = body.callback_query?.data;

    if (message) {
      const senderId = body.callback_query
        ? body.callback_query.from.id.toString()
        : message.from.id.toString();

      const senderName = body.callback_query
        ? `${body.callback_query.from.first_name || ''} ${body.callback_query.from.last_name || ''}`.trim()
        : `${message.from.first_name || ''} ${message.from.last_name || ''}`.trim();

      await processIncomingMessage({
        channelId: channel.id,
        teamId: channel.teamId,
        channelType: 'TELEGRAM',
        platformUserId: senderId,
        platformUserName: senderName,
        message: callbackData || message.text || '',
        messageType: callbackData
          ? 'BUTTON'
          : message.photo
          ? 'IMAGE'
          : 'TEXT',
        metadata: {
          chatId: message.chat.id,
          ...(message.photo && { photo: message.photo }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
