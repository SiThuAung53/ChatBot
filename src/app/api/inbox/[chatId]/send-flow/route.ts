import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { executeFlow } from '@/lib/flowEngine';

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { flowId } = await req.json();

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

  const flow = await prisma.flow.findFirst({
    where: { id: flowId, teamId: session.user.teamId },
  });

  if (!flow) {
    return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
  }

  // Execute the flow manually
  await executeFlow(flow, chat.contact, chat, {
    channelId: chat.channelId,
    teamId: session.user.teamId,
    channelType: chat.channel.type,
    message: '',
    messageType: 'TEXT',
  });

  return NextResponse.json({ success: true });
}
