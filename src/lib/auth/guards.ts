import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { auth, signOut } from '@/lib/auth/auth';
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
  if (session.user.suspended) {
    await signOut({ redirectTo: '/login' });
    redirect('/login');
  }
  if (!session.user.profileComplete) redirect('/complete-profile');
  return session;
}

// Requires TUTOR role; does NOT require APPROVED status.
// Use for info pages (pending-status, rejected) accessible to non-approved tutors.
export async function requireTutor(): Promise<Session> {
  const session = await requireUser();
  if (session.user.role !== 'TUTOR') redirect('/dashboard');
  return session;
}

// Requires TUTOR role AND APPROVED status.
// Use for the main tutor area (/tutor/*).
export async function requireApprovedTutor(): Promise<Session> {
  const session = await requireTutor();
  const status = session.user.tutorStatus;
  if (status === 'REJECTED' || status === 'SUSPENDED') redirect('/tutor/rejected');
  if (status !== 'APPROVED') {
    if (!session.user.onboardingComplete) redirect('/tutor/onboarding');
    redirect('/tutor/pending-status');
  }
  return session;
}

// Admin guard: returns 404 rather than revealing the admin area exists.
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') notFound();
  return session;
}
