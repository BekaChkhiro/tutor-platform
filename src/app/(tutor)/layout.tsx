import { requireApprovedTutor } from '@/lib/auth/guards';
import { TutorSidebar, TutorNavItems } from '@/components/layout/tutor-sidebar';
import { TutorTopbar } from '@/components/layout/tutor-topbar';

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireApprovedTutor();

  return (
    <>
      <a
        href="#main-content"
        className="focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh">
        <TutorSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TutorTopbar session={session} mobileNav={<TutorNavItems />} />
          <div id="main-content" className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
