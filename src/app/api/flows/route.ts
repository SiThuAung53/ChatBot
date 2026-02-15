import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const flows = await prisma.flow.findMany({
    where: { teamId: session.user.teamId },
    include: {
      _count: { select: { executions: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(flows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const flow = await prisma.flow.create({
    data: {
      name: body.name || 'Untitled Flow',
      description: body.description,
      teamId: session.user.teamId,
      botId: body.botId,
      triggerType: body.triggerType || 'KEYWORD',
      triggerValue: body.triggerValue,
      nodes: [],
      edges: [],
    },
  });

  return NextResponse.json(flow);
}
