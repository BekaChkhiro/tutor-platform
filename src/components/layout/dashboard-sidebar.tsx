import Link from 'next/link';
import { LayoutDashboard, BookOpen, CreditCard, Settings, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from './nav-link';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/consultations', label: 'Consultations', icon: BookOpen },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
];

export function DashboardNavItems() {
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

export function DashboardSidebar() {
  return (
    <aside
      className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 flex-col border-r md:flex"
      aria-label="Dashboard sidebar"
    >
      <div className="border-sidebar-border flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="text-sidebar-foreground font-semibold">
          My Dashboard
        </Link>
      </div>
      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto">
        <DashboardNavItems />
      </nav>
    </aside>
  );
}
