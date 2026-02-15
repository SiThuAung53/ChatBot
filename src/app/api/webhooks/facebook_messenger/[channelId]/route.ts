import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processIncomingMessage } from '@/lib/messaging';

// Webhook verification
export async function GET(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Receive messages
export async function POST(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const body = await req.json();

    if (body.object !== 'page') {
      return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    }

    const channel = await prisma.channel.findFirst({
      where: { id: params.channelId, type: 'FACEBOOK_MESSENGER' },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        if (event.message) {
          await processIncomingMessage({
            channelId: channel.id,
            teamId: channel.teamId,
            channelType: 'FACEBOOK_MESSENGER',
            platformUserId: event.sender.id,
            message: event.message.text || '',
            messageType: event.message.attachments ? 'IMAGE' : 'TEXT',
            metadata: event.message,
          });
        }

        if (event.postback) {
          await processIncomingMessage({
            channelId: channel.id,
            teamId: channel.teamId,
            channelType: 'FACEBOOK_MESSENGER',
            platformUserId: event.sender.id,
            message: event.postback.payload || event.postback.title,
            messageType: 'BUTTON',
            metadata: event.postback,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Facebook webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
