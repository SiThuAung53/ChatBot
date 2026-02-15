import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { role } = await req.json();

  const member = await prisma.teamMember.updateMany({
    where: {
      id: params.memberId,
      teamId: session.user.teamId,
      role: { not: 'OWNER' }, // Can't change owner role
    },
    data: { role },
  });

  return NextResponse.json(member);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.teamMember.deleteMany({
    where: {
      id: params.memberId,
      teamId: session.user.teamId,
      role: { not: 'OWNER' },
    },
  });

  return NextResponse.json({ success: true });
}
