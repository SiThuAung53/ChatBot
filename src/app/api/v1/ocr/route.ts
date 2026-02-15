import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, unauthorized } from '@/lib/apiAuth';

// POST /api/v1/ocr - Process image with OCR
export async function POST(req: NextRequest) {
  const key = await validateApiKey(req);
  if (!key) return unauthorized();

  const contentType = req.headers.get('content-type') || '';
  let imageUrl = '';
  let imageBase64 = '';

  if (contentType.includes('application/json')) {
    const body = await req.json();
    imageUrl = body.imageUrl || '';
    imageBase64 = body.imageBase64 || '';
  }

  if (!imageUrl && !imageBase64) {
    return NextResponse.json(
      { error: 'Provide imageUrl or imageBase64' },
      { status: 400 }
    );
  }

  try {
    // Use external OCR API
    if (process.env.OCR_API_URL && process.env.OCR_API_KEY) {
      const formData = new FormData();
      if (imageUrl) {
        formData.append('url', imageUrl);
      } else if (imageBase64) {
        formData.append('base64Image', `data:image/png;base64,${imageBase64}`);
      }
      formData.append('apikey', process.env.OCR_API_KEY);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');

      const res = await fetch(process.env.OCR_API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      return NextResponse.json({
        success: true,
        text: data.ParsedResults?.[0]?.ParsedText || '',
        confidence: data.ParsedResults?.[0]?.TextOverlay?.confidence || 0,
        raw: data,
      });
    }

    // Fallback: Tesseract.js (server-side)
    return NextResponse.json({
      success: false,
      error: 'OCR service not configured. Set OCR_API_URL and OCR_API_KEY.',
    }, { status: 503 });
  } catch (err) {
    console.error('OCR error:', err);
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    );
  }
}
