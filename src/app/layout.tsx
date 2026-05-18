import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { notoSansGeorgian, inter, jetBrainsMono } from './fonts';

export const metadata: Metadata = {
  title: 'Tutor',
  description: 'Online tutoring marketplace',
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
