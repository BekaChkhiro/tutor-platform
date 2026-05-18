import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign in — Tutor',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
