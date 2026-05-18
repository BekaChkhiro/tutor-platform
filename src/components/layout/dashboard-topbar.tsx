import Link from 'next/link';
import { MobileDrawer } from './mobile-drawer';
import type { Session } from 'next-auth';

interface DashboardTopbarProps {
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

export function DashboardTopbar({ session, mobileNav }: DashboardTopbarProps) {
  const initials = userInitials(session.user.name, session.user.email);

  return (
    <header className="bg-background border-border sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <MobileDrawer label="Dashboard navigation">{mobileNav}</MobileDrawer>

      <Link href="/dashboard" className="text-foreground font-semibold md:hidden">
        Tutor
      </Link>

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
