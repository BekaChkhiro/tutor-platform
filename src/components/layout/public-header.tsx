import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/tutors', label: 'Browse Tutors' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export async function PublicHeader() {
  const session = await auth();

  return (
    <header className="border-border bg-background/95 supports-backdrop-blur:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main-content"
        className="focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="text-foreground shrink-0 text-base font-semibold tracking-tight">
          Tutor
        </Link>

        <nav aria-label="Main navigation" className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {session ? (
            <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm' }))}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                Sign in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: 'sm' }))}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
