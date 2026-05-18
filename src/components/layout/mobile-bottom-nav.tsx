'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, CreditCard, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'მთავარი', icon: LayoutDashboard },
  { href: '/dashboard/consultations', label: 'კონს.', icon: Calendar },
  { href: '/dashboard/payments', label: 'გადახდა', icon: CreditCard },
  { href: '/dashboard/settings', label: 'პარამ.', icon: Settings },
  { href: '/dashboard/support', label: 'დახმ.', icon: HelpCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-border bg-background fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center border-t lg:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
