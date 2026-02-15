import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/apiAuth';

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
