import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import type { Session } from 'next-auth';

async function getPathname(): Promise<string> {
  const h = await headers();
  return h.get('x-pathname') ?? '/';
}

export async function requireUser(): Promise<Session> {
  const session = await auth();
  if (!session) {
    const pathname = await getPathname();
    redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }
  if (!session.user.profileComplete) redirect('/complete-profile');
  return session;
}

export async function requireTutor(): Promise<Session> {
  const session = await requireUser();

  if (session.user.role !== 'TUTOR') redirect('/dashboard');

  const status = session.user.tutorStatus;
  if (status === 'REJECTED' || status === 'SUSPENDED') redirect('/tutor/rejected');
  if (status !== 'APPROVED') redirect('/tutor/pending-status');

  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') notFound();
  return session;
}
