import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateApiKey } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { teamId: session.user.teamId },
    select: {
      id: true,
      name: true,
      key: true,
      isActive: true,
      createdAt: true,
      lastUsed: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Mask API keys (show only last 8 chars)
  const maskedKeys = keys.map((k) => ({
    ...k,
    key: `cb_${'*'.repeat(32)}${k.key.slice(-8)}`,
    fullKey: undefined,
  }));

  return NextResponse.json(maskedKeys);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  const key = await prisma.apiKey.create({
    data: {
      teamId: session.user.teamId,
      name: name || 'API Key',
      key: generateApiKey(),
    },
  });

  // Return full key only on creation
  return NextResponse.json(key);
}
