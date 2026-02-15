import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channel = await prisma.channel.findFirst({
    where: { id: params.id, teamId: session.user.teamId },
  });

  if (!channel) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Remove Telegram webhook if applicable
  if (channel.type === 'TELEGRAM' && channel.botToken) {
    try {
      await fetch(
        `https://api.telegram.org/bot${channel.botToken}/deleteWebhook`
      );
    } catch (err) {
      console.error('Failed to remove Telegram webhook:', err);
    }
  }

  await prisma.channel.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
