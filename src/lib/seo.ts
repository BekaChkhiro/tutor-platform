import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tutorplatform.ge';
export const SITE_NAME = 'Tutor';
export const SITE_DESCRIPTION =
  'Find expert tutors and book consultations online. Browse by category, view profiles, and connect instantly.';

export function buildPageMetadata({
  title,
  description,
  path,
  ogImageParams = {},
}: {
  title: string;
  description: string;
  path: string;
  ogImageParams?: Record<string, string>;
}): Metadata {
  const ogUrl = new URL('/api/og', SITE_URL);
  ogUrl.searchParams.set('title', title);
  if (ogImageParams.subtitle) ogUrl.searchParams.set('subtitle', ogImageParams.subtitle);

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { 'ka-GE': path },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
}
