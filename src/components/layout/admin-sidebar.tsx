'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  Users,
  User,
  Tag,
  DollarSign,
  RefreshCw,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/bookings', label: 'ჯავშნები', icon: CalendarCheck },
  { href: '/admin/tutors', label: 'მასწავლებლები', icon: Users },
  { href: '/admin/users', label: 'მომხმარებლები', icon: User },
  { href: '/admin/categories', label: 'კატეგორიები', icon: Tag },
  { href: '/admin/payouts', label: 'გადახდები', icon: DollarSign },
  { href: '/admin/refunds', label: 'დაბრუნებები', icon: RefreshCw },
  { href: '/admin/audit', label: 'აუდიტი', icon: ShieldCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar border-sidebar-border hidden w-52 shrink-0 flex-col border-r lg:flex">
      <div className="border-sidebar-border flex h-16 items-center gap-2 border-b px-5">
        <GraduationCap className="text-sidebar-primary h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-sidebar-foreground text-sm leading-tight font-semibold">Tutor</span>
          <span className="text-sidebar-foreground/50 text-[10px] font-medium tracking-wide uppercase">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
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
