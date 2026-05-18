import Link from 'next/link';
import { MobileDrawer } from './mobile-drawer';
import { AdminBreadcrumbs } from './admin-breadcrumbs';
import type { Session } from 'next-auth';

interface AdminTopbarProps {
  session: Session;
  mobileNav: React.ReactNode;
}

function userInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.[0]?.toUpperCase() ?? '?';
}

export function AdminTopbar({ session, mobileNav }: AdminTopbarProps) {
  const initials = userInitials(session.user.name, session.user.email);

  return (
    <header className="bg-background border-border sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <MobileDrawer label="Admin navigation">{mobileNav}</MobileDrawer>

      <Link href="/admin" className="text-foreground font-semibold md:hidden">
        Admin
      </Link>

      <div className="hidden md:block">
        <AdminBreadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div
          title={session.user.name ?? session.user.email ?? 'Account'}
          aria-label={`Signed in as ${session.user.name ?? session.user.email}`}
          className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-xs font-semibold select-none"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
