import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <p className="text-muted-foreground text-8xl font-bold">404</p>
      <h1 className="text-2xl font-semibold">გვერდი ვერ მოიძებნა</h1>
      <p className="text-muted-foreground text-sm">მოთხოვნილი გვერდი არ არსებობს ან გადატანილია.</p>
      <Button render={<Link href="/" />}>მთავარ გვერდზე დაბრუნება</Button>
    </main>
  );
}
