import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Tag,
  Banknote,
  RotateCcw,
  ClipboardList,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from './nav-link';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/tutors', label: 'Tutors', icon: GraduationCap },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/payouts', label: 'Payouts', icon: Banknote },
  { href: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
  { href: '/admin/audit', label: 'Audit Log', icon: ClipboardList },
];

export function AdminNavItems() {
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

export function AdminSidebar() {
  return (
    <aside
      className="bg-sidebar border-sidebar-border hidden w-64 shrink-0 flex-col border-r md:flex"
      aria-label="Admin sidebar"
    >
      <div className="border-sidebar-border flex h-14 items-center border-b px-4">
        <Link href="/admin" className="text-sidebar-foreground font-semibold">
          Admin
        </Link>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto">
        <AdminNavItems />
      </nav>
    </aside>
  );
}
