import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function validateApiKey(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!apiKey) return null;

  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey, isActive: true },
    include: { team: true },
  });

  if (key) {
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() },
    });
  }

  return key;
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Invalid or missing API key. Include x-api-key header.' },
    { status: 401 }
  );
}
