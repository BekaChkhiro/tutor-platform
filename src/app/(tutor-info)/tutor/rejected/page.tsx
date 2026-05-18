import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Application not approved — Tutor',
};

export default function TutorRejectedPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="mx-auto w-full max-w-sm space-y-4 text-center">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-6">
          <p className="font-medium">Application not approved</p>
          <p className="mt-1 text-sm">
            Unfortunately your tutor application was not approved at this time.
          </p>
          <p className="text-muted-foreground mt-3 text-sm">
            If you have questions, please{' '}
            <Link href="/contact" className="underline">
              contact support
            </Link>
            .
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
