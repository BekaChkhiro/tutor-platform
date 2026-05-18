import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardTopbar } from '@/components/layout/dashboard-topbar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (!session.user.profileComplete) {
    redirect('/complete-profile');
  }

  // next-auth v5 beta: Omit<User|undefined,'id'> collapses name/image — access via unknown cast
  const { name: userName = null, image: userImage = null } = session.user as {
    name?: string | null;
    image?: string | null;
  };

  return (
    <div className="flex min-h-svh">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar userName={userName} userImage={userImage} />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
