import { requireUser } from '@/lib/auth/guards';
import { DashboardSidebar, DashboardNavItems } from '@/components/layout/dashboard-sidebar';
import { DashboardTopbar } from '@/components/layout/dashboard-topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();

  return (
    <>
      <a
        href="#main-content"
        className="focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar session={session} mobileNav={<DashboardNavItems />} />
          <div id="main-content" className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
