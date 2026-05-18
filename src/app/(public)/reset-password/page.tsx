import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Set new password — Tutor',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <div className="mx-auto w-full max-w-sm space-y-4 text-center">
          <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-6">
            <p className="font-medium">Invalid reset link</p>
            <p className="mt-1 text-sm">No reset token found in the link.</p>
          </div>
          <Link
            href="/forgot-password"
            className="text-foreground text-sm font-medium hover:underline"
          >
            Request a new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <ResetPasswordForm token={token} />
    </main>
  );
}
