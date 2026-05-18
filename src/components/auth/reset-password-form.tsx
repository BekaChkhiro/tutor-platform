'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/password-reset';
import { resetPassword } from '@/server/actions/auth/password-reset';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(resetPasswordSchema as any),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null);
    const result = await resetPassword(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-sm space-y-4 text-center">
        <div className="bg-primary/10 text-primary rounded-xl p-6">
          <p className="font-medium">Password updated</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your password has been changed. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-muted-foreground text-sm">Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register('token')} />

        {serverError && (
          <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
            {serverError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            New password
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="new-password"
            className={cn(
              'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
              errors.password &&
                'border-destructive focus:border-destructive focus:ring-destructive/20',
            )}
            placeholder="Min. 8 chars, 1 letter + 1 digit"
          />
          {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm new password
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={cn(
              'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
              errors.confirmPassword &&
                'border-destructive focus:border-destructive focus:ring-destructive/20',
            )}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
