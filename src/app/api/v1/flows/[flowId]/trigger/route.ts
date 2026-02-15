import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, unauthorized } from '@/lib/apiAuth';
import { executeFlow } from '@/lib/flowEngine';

// POST /api/v1/flows/:flowId/trigger - Trigger a flow via API
export async function POST(
  req: NextRequest,
  { params }: { params: { flowId: string } }
) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const { contactId, chatId, variables } = await req.json();

  const flow = await prisma.flow.findFirst({
    where: { id: params.flowId, teamId: key.teamId },
  });

  if (!flow) {
    return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
  }

  let contact = null;
  let chat = null;

  if (contactId) {
    contact = await prisma.contact.findFirst({
      where: { id: contactId, teamId: key.teamId },
    });
  }

  if (chatId) {
    chat = await prisma.chat.findFirst({
      where: { id: chatId },
      include: { channel: true },
    });
  }

  if (contact && chat) {
    await executeFlow(flow, contact, chat, {
      channelId: chat.channelId,
      teamId: key.teamId,
      channelType: chat.channel.type,
      message: '',
      messageType: 'TEXT',
      ...(variables || {}),
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Flow triggered successfully',
  });
}
