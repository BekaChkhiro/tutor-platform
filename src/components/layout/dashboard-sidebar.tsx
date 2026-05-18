'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'მთავარი', icon: LayoutDashboard },
  { href: '/dashboard/consultations', label: 'კონსულტაციები', icon: Calendar },
  { href: '/dashboard/payments', label: 'გადახდები', icon: CreditCard },
  { href: '/dashboard/settings', label: 'პარამეტრები', icon: Settings },
  { href: '/dashboard/support', label: 'დახმარება', icon: HelpCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar border-sidebar-border hidden w-56 shrink-0 flex-col border-r lg:flex">
      {/* Logo area */}
      <div className="border-sidebar-border flex h-16 items-center gap-2 border-b px-5">
        <GraduationCap className="text-sidebar-primary h-5 w-5" />
        <span className="text-sidebar-foreground text-base font-semibold">Tutor</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
