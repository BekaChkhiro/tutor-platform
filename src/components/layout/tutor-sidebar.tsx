import Link from 'next/link';
import { LayoutDashboard, BookOpen, CalendarDays, BarChart2, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from './nav-link';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/tutor/consultations', label: 'Consultations', icon: BookOpen },
  { href: '/tutor/availability', label: 'Availability', icon: CalendarDays },
  { href: '/tutor/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/tutor/settings', label: 'Settings', icon: Settings },
];

export function TutorNavItems() {
  return (
    <ul className="space-y-0.5 px-3 py-4">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
        <li key={href}>
          <NavLink
            href={href}
            exact={exact}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function TutorSidebar() {
  return (
    <aside
      className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 flex-col border-r md:flex"
      aria-label="Tutor sidebar"
    >
      <div className="border-sidebar-border flex h-14 items-center border-b px-4">
        <Link href="/tutor/dashboard" className="text-sidebar-foreground font-semibold">
          Tutor Portal
        </Link>
      </div>
      <nav aria-label="Tutor navigation" className="flex-1 overflow-y-auto">
        <TutorNavItems />
      </nav>
    </aside>
  );
}
