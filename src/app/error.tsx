'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <p className="text-muted-foreground text-8xl font-bold">500</p>
      <h1 className="text-2xl font-semibold">შეცდომა მოხდა</h1>
      <p className="text-muted-foreground text-sm">
        სამწუხაროდ, რაღაც შეფერხება მოხდა. გთხოვთ სცადოთ ხელახლა.
      </p>
      {error.digest && (
        <p className="text-muted-foreground font-mono text-xs">ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          ხელახლა სცადე
        </Button>
        <Button render={<Link href="/" />}>მთავარ გვერდზე</Button>
      </div>
    </main>
  );
}
