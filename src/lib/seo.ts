import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = 'Tutor';

const DEFAULT_DESCRIPTION =
  '100+ დადასტურებული სპეციალისტი სხვადასხვა სფეროში. დაჯავშნე ვიდეო კონსულტაცია ონლაინ — TBC ან BOG გადახდით.';

interface PageMetaOptions {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'profile' | 'article';
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  ogImage = '/api/og',
  ogType = 'website',
}: PageMetaOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { 'ka-GE': path },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'ka_GE',
      type: ogType,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
