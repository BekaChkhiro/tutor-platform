import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (!session.user.profileComplete) {
    redirect('/complete-profile');
  }

  return <>{children}</>;
}
