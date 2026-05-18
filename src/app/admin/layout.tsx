import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminTopbar } from '@/components/layout/admin-topbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
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
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar userName={userName} userImage={userImage} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
