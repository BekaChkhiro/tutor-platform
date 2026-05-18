import type { Metadata } from 'next';
import Link from 'next/link';
import { verifyEmail } from '@/server/actions/auth/register';

export const metadata: Metadata = {
  title: 'Verify email — Tutor',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyLayout status="missing" />;
  }

  const result = await verifyEmail(token);

  if (!result.success) {
    return <VerifyLayout status="error" message={result.error} />;
  }

  return <VerifyLayout status="success" />;
}

function VerifyLayout({
  status,
  message,
}: {
  status: 'success' | 'error' | 'missing';
  message?: string;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="mx-auto w-full max-w-sm space-y-4 text-center">
        {status === 'success' && (
          <>
            <div className="bg-primary/10 text-primary rounded-xl p-6">
              <p className="font-medium">Email verified!</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Your account is now active. You can sign in.
              </p>
            </div>
            <Link
              href="/login"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
            >
              Go to sign in
            </Link>
          </>
        )}

        {(status === 'error' || status === 'missing') && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-6">
            <p className="font-medium">Verification failed</p>
            <p className="mt-1 text-sm">{message ?? 'No verification token provided.'}</p>
            <p className="text-muted-foreground mt-3 text-sm">
              <Link href="/register" className="underline">
                Register again
              </Link>{' '}
              to receive a new link.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
