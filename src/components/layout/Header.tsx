import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="text-primary size-6" />
          <span className="text-lg tracking-tight">Tutor</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="მთავარი ნავიგაცია">
          <Link
            href="/tutors"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            ექსპერტები
          </Link>
          <Link
            href="/#how-it-works"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            როგორ მუშაობს
          </Link>
          <Link
            href="/faq"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            კითხვები
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            შესვლა
          </Link>
          <Link href="/register" className={cn(buttonVariants({ size: 'sm' }))}>
            რეგისტრაცია
          </Link>
        </div>
      </div>
    </header>
  );
}
