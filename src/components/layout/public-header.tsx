'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'მთავარი' },
  { href: '/tutors', label: 'მასწავლებლები' },
  { href: '/consultations', label: 'კონსულტაციები' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'კონტაქტი' },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-border bg-background sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="text-primary h-6 w-6" />
          <span className="text-foreground text-lg">Tutor</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href && 'text-foreground bg-accent',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="text-foreground hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            შესვლა
          </Link>
          <Link
            href="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            რეგისტრაცია
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground rounded-md p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="მენიუ"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-border bg-background border-t md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-muted-foreground hover:text-foreground rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === link.href && 'text-foreground bg-accent',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-border mt-3 flex flex-col gap-2 border-t pt-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-foreground hover:bg-accent rounded-md px-3 py-2.5 text-center text-sm font-medium transition-colors"
              >
                შესვლა
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2.5 text-center text-sm font-medium transition-colors"
              >
                რეგისტრაცია
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
