'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  users: 'Users',
  tutors: 'Tutors',
  bookings: 'Bookings',
  categories: 'Categories',
  payouts: 'Payouts',
  refunds: 'Refunds',
  audit: 'Audit',
  settings: 'Settings',
};

function labelFor(seg: string): string {
  return SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: labelFor(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    current: i === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
            )}
            {crumb.current ? (
              <span aria-current="page" className="text-foreground font-medium">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
