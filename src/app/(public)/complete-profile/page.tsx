import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { CompleteProfileForm } from '@/components/auth/complete-profile-form';

export const metadata: Metadata = {
  title: 'Complete profile — Tutor',
};

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true, dob: true, role: true },
  });

  if (user?.phone && user?.dob) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl ?? '/dashboard');
  }

  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <CompleteProfileForm
        userId={session.user.id}
        callbackUrl={callbackUrl ?? '/dashboard'}
        isТutor={user?.role === 'TUTOR'}
      />
    </main>
  );
}
