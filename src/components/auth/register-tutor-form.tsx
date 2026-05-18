'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  tutorRegistrationFormSchema,
  type TutorRegistrationInput,
  maskGeorgianPhone,
} from '@/lib/validators/registration';
import { registerTutor } from '@/server/actions/auth/register';

export function RegisterTutorForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TutorRegistrationInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tutorRegistrationFormSchema as any),
  });

  async function onSubmit(data: TutorRegistrationInput) {
    setServerError(null);
    const result = await registerTutor(data);
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
          <p className="font-medium">Application submitted!</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Check your email for a verification link. Once verified, your profile will be reviewed.
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Apply as a tutor</h1>
        <p className="text-muted-foreground text-sm">
          Your profile will be reviewed before going live
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
            {serverError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={errors.firstName?.message}>
            <input
              {...register('firstName')}
              autoComplete="given-name"
              className={inputCls(!!errors.firstName)}
              placeholder="Giorgi"
            />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <input
              {...register('lastName')}
              autoComplete="family-name"
              className={inputCls(!!errors.lastName)}
              placeholder="Beridze"
            />
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className={inputCls(!!errors.email)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="tel"
            autoComplete="tel"
            className={inputCls(!!errors.phone)}
            placeholder="+995 555 123 456"
            onChange={(e) => {
              const masked = maskGeorgianPhone(e.target.value);
              e.target.value = masked;
              setValue('phone', masked, { shouldValidate: true });
            }}
          />
        </Field>

        <Field label="Date of birth" error={errors.dob?.message}>
          <input
            {...register('dob')}
            type="date"
            autoComplete="bday"
            className={inputCls(!!errors.dob)}
          />
        </Field>

        <Field label="Gender" error={errors.gender?.message}>
          <select {...register('gender')} className={inputCls(!!errors.gender)}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other / prefer not to say</option>
          </select>
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            className={inputCls(!!errors.password)}
            placeholder="Min. 8 chars, 1 letter + 1 digit"
          />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <input
            {...register('confirmPassword')}
            type="password"
            autoComplete="new-password"
            className={inputCls(!!errors.confirmPassword)}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting application…' : 'Submit application'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Registering as a student?{' '}
        <Link href="/register" className="text-foreground font-medium hover:underline">
          User registration
        </Link>
      </p>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
    'placeholder:text-muted-foreground',
    'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
    hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
