'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  completeProfileFormSchema,
  type CompleteProfileInput,
  maskGeorgianPhone,
} from '@/lib/validators/registration';
import { completeProfile } from '@/server/actions/auth/register';
import { PhotoUpload } from '@/components/auth/photo-upload';

interface CompleteProfileFormProps {
  userId: string;
  callbackUrl?: string;
  isТutor?: boolean;
}

export function CompleteProfileForm({
  userId,
  callbackUrl = '/dashboard',
  isТutor = false,
}: CompleteProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(completeProfileFormSchema as any),
  });

  async function onSubmit(data: CompleteProfileInput) {
    setServerError(null);
    const result = await completeProfile(userId, data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.replace(callbackUrl);
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Complete your profile</h1>
        <p className="text-muted-foreground text-sm">
          A few more details are required before you can continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
            {serverError}
          </p>
        )}

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

        {isТutor && (
          <>
            <Field label="Gender" error={errors.gender?.message}>
              <select {...register('gender')} className={inputCls(!!errors.gender)}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other / prefer not to say</option>
              </select>
            </Field>

            <Field label="Profile photo (optional)">
              <PhotoUpload className="mt-1" />
            </Field>
          </>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save and continue'}
        </Button>
      </form>
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
