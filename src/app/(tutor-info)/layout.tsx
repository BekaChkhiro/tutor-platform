import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';

export default async function TutorInfoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user.role !== 'TUTOR') redirect('/dashboard');
  return <>{children}</>;
}
