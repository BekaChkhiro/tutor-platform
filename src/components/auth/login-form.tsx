'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = '/dashboard' }: LoginFormProps) {
  const safeCallbackUrl =
    callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password.');
        return;
      }

      window.location.assign(safeCallbackUrl);
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signIn('google', { callbackUrl: safeCallbackUrl });
    } catch {
      setError('Unable to continue with Google right now. Please try again.');
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">Continue to your account</p>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <hr className="border-border flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <hr className="border-border flex-1" />
      </div>

      <form onSubmit={handleCredentials} className="space-y-4">
        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
            )}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
            )}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        No account?{' '}
        <Link href="/register" className="text-foreground font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
