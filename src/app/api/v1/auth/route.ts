import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API key authentication for mobile app
async function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return null;

  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey, isActive: true },
    include: { team: true },
  });

  if (key) {
    // Update last used
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() },
    });
  }

  return key;
}

export { validateApiKey };

// Token verification endpoint
export async function POST(req: NextRequest) {
  const key = await validateApiKey(req);
  if (!key) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  return NextResponse.json({
    valid: true,
    teamId: key.teamId,
    teamName: key.team.name,
  });
}
