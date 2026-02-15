import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateApiKey, unauthorized } from '@/lib/apiAuth';

// GET /api/v1/flows - List flows
export async function GET(req: NextRequest) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const flows = await prisma.flow.findMany({
    where: { teamId: key.teamId },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      triggerType: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { executions: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ flows });
}
