import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, unauthorized } from '@/lib/apiAuth';

// POST /api/v1/external - Proxy requests to external services
export async function POST(req: NextRequest) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const { url, method = 'GET', headers = {}, body } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: responseData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'External request failed', message: err.message },
      { status: 502 }
    );
  }
}
