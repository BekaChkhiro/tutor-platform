import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { TutorSidebar } from '@/components/layout/tutor-sidebar';
import { TutorTopbar } from '@/components/layout/tutor-topbar';

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
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
      <TutorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TutorTopbar userName={userName} userImage={userImage} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
