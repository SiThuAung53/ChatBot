import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sheets = await prisma.googleSheet.findMany({
    where: { teamId: session.user.teamId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(sheets);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, spreadsheetId, sheetName } = await req.json();

  const sheet = await prisma.googleSheet.create({
    data: {
      teamId: session.user.teamId,
      name,
      spreadsheetId,
      sheetName: sheetName || 'Sheet1',
      isConnected: true,
    },
  });

  return NextResponse.json(sheet);
}
