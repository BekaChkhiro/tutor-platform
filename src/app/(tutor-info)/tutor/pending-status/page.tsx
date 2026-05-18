import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Application under review — Tutor',
};

export default function TutorPendingStatusPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="mx-auto w-full max-w-sm space-y-4 text-center">
        <div className="bg-primary/10 text-primary rounded-xl p-6">
          <p className="font-medium">Application under review</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your tutor application is being reviewed by our team. We&apos;ll notify you by email
            once a decision has been made.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
