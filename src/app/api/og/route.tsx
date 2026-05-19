import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { SITE_NAME } from '@/lib/seo';

export const runtime = 'edge';

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') ?? SITE_NAME;
  const subtitle = searchParams.get('subtitle') ?? '';

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a56db 0%, #0e3fa6 100%)',
        padding: '60px 72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            background: 'rgba(255,255,255,0.15)',
            padding: '6px 18px',
            borderRadius: 8,
          }}
        >
          {SITE_NAME}
        </div>
      </div>
      <div
        style={{
          fontSize: title.length > 50 ? 44 : 56,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.15,
          marginBottom: subtitle ? 20 : 0,
          maxWidth: '900px',
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.80)',
            lineHeight: 1.4,
            maxWidth: '800px',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>,
    { width: 1200, height: 630 },
  );
}
