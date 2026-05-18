import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset password — Tutor',
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="text-muted-foreground text-sm">Password reset flow — coming in T1.4.</p>
      </div>
    </main>
  );
}
