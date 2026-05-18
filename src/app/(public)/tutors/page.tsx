import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Browse Tutors',
  description:
    'Browse qualified tutors across all subjects and specialisations. Filter by category, price, and availability.',
  path: '/tutors',
});

export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Tutors</h1>
      <p className="text-muted-foreground text-sm">Placeholder route.</p>
    </main>
  );
}
