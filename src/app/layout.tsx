import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { notoSansGeorgian, inter, jetBrainsMono } from './fonts';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    '100+ დადასტურებული სპეციალისტი სხვადასხვა სფეროში. დაჯავშნე ვიდეო კონსულტაცია ონლაინ.',
  openGraph: {
    siteName: SITE_NAME,
    locale: 'ka_GE',
    type: 'website',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(notoSansGeorgian.variable, inter.variable, jetBrainsMono.variable)}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
