'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators/password-reset';
import { requestPasswordReset } from '@/server/actions/auth/password-reset';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(forgotPasswordSchema as any),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null);
    const result = await requestPasswordReset(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-sm space-y-4 text-center">
        <div className="bg-primary/10 text-primary rounded-xl p-6">
          <p className="font-medium">Check your email</p>
          <p className="text-muted-foreground mt-1 text-sm">
            If that address is registered, you&apos;ll receive a password reset link shortly.
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          Back to{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
            {serverError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            className={cn(
              'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
              errors.email &&
                'border-destructive focus:border-destructive focus:ring-destructive/20',
            )}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Remembered your password?{' '}
        <Link href="/login" className="text-foreground font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
