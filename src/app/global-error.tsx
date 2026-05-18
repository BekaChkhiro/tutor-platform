'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="ka">
      <body className="antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
          <p className="text-8xl font-bold text-gray-400">500</p>
          <h1 className="text-2xl font-semibold">კრიტიკული შეცდომა</h1>
          <p className="text-sm text-gray-500">
            სამწუხაროდ, სერიოზული შეფერხება მოხდა. გთხოვთ სცადოთ ხელახლა.
          </p>
          {error.digest && <p className="font-mono text-xs text-gray-400">ID: {error.digest}</p>}
          <button
            onClick={reset}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            ხელახლა სცადე
          </button>
        </main>
      </body>
    </html>
  );
}
