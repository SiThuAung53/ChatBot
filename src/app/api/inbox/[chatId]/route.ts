import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const chat = await prisma.chat.update({
    where: { id: params.chatId },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.assignedTo && { assignedTo: body.assignedTo }),
    },
  });

  return NextResponse.json(chat);
}
