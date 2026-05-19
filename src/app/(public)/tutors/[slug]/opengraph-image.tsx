import { ImageResponse } from 'next/og';
import { fetchTutorBySlug } from '@/lib/tutors/fetch-tutor';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default async function TutorOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutor = await fetchTutorBySlug(slug);

  const name = tutor
    ? [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'სპეციალისტი'
    : 'სპეციალისტი';
  const headline = tutor?.headline ?? '';
  const avgRating =
    tutor && tutor.reviews.length > 0
      ? (tutor.reviews.reduce((s, r) => s + r.rating, 0) / tutor.reviews.length).toFixed(1)
      : null;

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #EEF1FF 0%, #ffffff 100%)',
        padding: '60px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '400px',
          height: '630px',
          background: 'linear-gradient(180deg, #3D52F5 0%, #1F30B8 100%)',
          borderRadius: '0 0 0 80px',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        <div
          style={{
            fontSize: '14px',
            color: '#9CA3AF',
            marginBottom: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          TUTOR — სპეციალისტი
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: '700',
            color: '#1A1A1A',
            lineHeight: '1.1',
            marginBottom: '16px',
          }}
        >
          {name}
        </div>
        {headline && (
          <div
            style={{
              fontSize: '24px',
              color: '#4B5563',
              marginBottom: '24px',
              maxWidth: '700px',
            }}
          >
            {headline}
          </div>
        )}
        {avgRating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '20px',
              color: '#1A1A1A',
            }}
          >
            <span style={{ color: '#FBBF24' }}>★</span>
            <span style={{ fontWeight: '600' }}>{avgRating}</span>
            <span style={{ color: '#9CA3AF' }}>· {tutor?.reviews.length} შეფასება</span>
          </div>
        )}
      </div>
    </div>,
    { ...size },
  );
}
