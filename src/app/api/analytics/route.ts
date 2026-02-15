import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get('period') || '7d';
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const teamId = session.user.teamId;

  // Total messages
  const totalMessages = await prisma.message.count({
    where: {
      chat: { channel: { teamId } },
      createdAt: { gte: since },
    },
  });

  // Total contacts
  const totalContacts = await prisma.contact.count({
    where: { teamId },
  });

  // Active chats
  const activeChats = await prisma.chat.count({
    where: {
      channel: { teamId },
      status: { in: ['OPEN', 'ASSIGNED'] },
    },
  });

  // Messages by day
  const messages = await prisma.message.findMany({
    where: {
      chat: { channel: { teamId } },
      createdAt: { gte: since },
    },
    select: { direction: true, createdAt: true },
  });

  const messagesByDayMap: Record<string, { incoming: number; outgoing: number }> = {};
  messages.forEach((m) => {
    const date = m.createdAt.toISOString().split('T')[0];
    if (!messagesByDayMap[date]) {
      messagesByDayMap[date] = { incoming: 0, outgoing: 0 };
    }
    if (m.direction === 'INCOMING') {
      messagesByDayMap[date].incoming++;
    } else {
      messagesByDayMap[date].outgoing++;
    }
  });

  const messagesByDay = Object.entries(messagesByDayMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top flows
  const flowExecutions = await prisma.flowExecution.groupBy({
    by: ['flowId'],
    _count: { id: true },
    where: { startedAt: { gte: since } },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const flowIds = flowExecutions.map((f) => f.flowId);
  const flows = await prisma.flow.findMany({
    where: { id: { in: flowIds } },
    select: { id: true, name: true },
  });

  const topFlows = flowExecutions.map((fe) => ({
    name: flows.find((f) => f.id === fe.flowId)?.name || 'Unknown',
    executions: fe._count.id,
  }));

  // Channel breakdown
  const channelEvents = await prisma.analyticsEvent.groupBy({
    by: ['channel'],
    _count: { id: true },
    where: {
      createdAt: { gte: since },
      channel: { not: null },
    },
  });

  const channelBreakdown = channelEvents.map((ce) => ({
    channel: ce.channel || 'Unknown',
    count: ce._count.id,
  }));

  // Contact growth
  const contacts = await prisma.contact.findMany({
    where: { teamId, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const contactGrowthMap: Record<string, number> = {};
  contacts.forEach((c) => {
    const date = c.createdAt.toISOString().split('T')[0];
    contactGrowthMap[date] = (contactGrowthMap[date] || 0) + 1;
  });

  const contactGrowth = Object.entries(contactGrowthMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    totalMessages,
    totalContacts,
    activeChats,
    messagesByDay,
    topFlows,
    channelBreakdown,
    contactGrowth,
  });
}
