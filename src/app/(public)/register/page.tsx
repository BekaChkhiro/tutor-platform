import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create account — Tutor',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-muted-foreground text-sm">Registration form — coming in T1.3.</p>
      </div>
    </main>
  );
}
