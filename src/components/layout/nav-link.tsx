'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  exact?: boolean;
  className?: string;
  activeClass?: string;
  inactiveClass?: string;
  children: React.ReactNode;
}

export function NavLink({
  href,
  exact = false,
  className,
  activeClass = 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
  inactiveClass = 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
  children,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(className, isActive ? activeClass : inactiveClass)}
    >
      {children}
    </Link>
  );
}
