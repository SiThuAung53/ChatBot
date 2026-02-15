import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if caller has admin/owner role
  const callerMembership = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      teamId: session.user.teamId,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  if (!callerMembership) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { email, role } = await req.json();

  // Find or check user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: 'User not found. They need to sign up first.' },
      { status: 404 }
    );
  }

  // Check not already a member
  const existing = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId: user.id, teamId: session.user.teamId },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'User is already a team member' },
      { status: 409 }
    );
  }

  const member = await prisma.teamMember.create({
    data: {
      userId: user.id,
      teamId: session.user.teamId,
      role: role || 'MEMBER',
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json(member);
}
