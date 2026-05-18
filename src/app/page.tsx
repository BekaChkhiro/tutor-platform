import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { buildPageMetadata, SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: `${SITE_NAME} — Online Tutoring Marketplace`,
    description: SITE_DESCRIPTION,
    path: '/',
  }),
  // Home page uses absolute title to avoid the `| Tutor` suffix.
  title: { absolute: `${SITE_NAME} — Online Tutoring Marketplace` },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-semibold">Tutor</h1>
      <p className="text-muted-foreground text-sm">Online tutoring marketplace — scaffold ready.</p>
      <Button>Test</Button>
    </main>
  );
}
