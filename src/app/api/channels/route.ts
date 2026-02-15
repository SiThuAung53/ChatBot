import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channels = await prisma.channel.findMany({
    where: { teamId: session.user.teamId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(channels);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { type, name, accessToken, pageId, botToken } = body;

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const channel = await prisma.channel.create({
    data: {
      type,
      name,
      teamId: session.user.teamId,
      accessToken: type === 'FACEBOOK_MESSENGER' ? accessToken : undefined,
      pageId: type === 'FACEBOOK_MESSENGER' ? pageId : undefined,
      botToken: type === 'TELEGRAM' ? botToken : undefined,
      isConnected: true,
    },
  });

  // Set webhook URL
  const webhookUrl = `${baseUrl}/api/webhooks/${type.toLowerCase()}/${channel.id}`;
  await prisma.channel.update({
    where: { id: channel.id },
    data: { webhookUrl },
  });

  // For Telegram, set the webhook automatically
  if (type === 'TELEGRAM' && botToken) {
    try {
      const telegramRes = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl }),
        }
      );
      const result = await telegramRes.json();
      if (!result.ok) {
        console.error('Failed to set Telegram webhook:', result);
      }
    } catch (err) {
      console.error('Telegram webhook setup error:', err);
    }
  }

  return NextResponse.json({ ...channel, webhookUrl });
}
