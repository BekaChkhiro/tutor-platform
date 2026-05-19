'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { contactSchema, CONTACT_SUBJECTS, type ContactInput } from '@/lib/validators/contact';
import { submitContactForm } from '@/server/actions/contact';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contactSchema as any),
  });

  async function onSubmit(data: ContactInput) {
    setServerError(null);
    const result = await submitContactForm(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">შეტყობინება გაიგზავნა!</p>
        <p className="mt-1 text-sm text-green-700">მადლობა, ჩვენ მოგვწერეთ. მალე გიპასუხებთ.</p>
      </div>
    );
  }

  const fieldClass = (hasError?: boolean) =>
    cn(
      'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
      'placeholder:text-muted-foreground',
      'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
      hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            სახელი <span className="text-destructive">*</span>
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            autoComplete="name"
            placeholder="თქვენი სახელი"
            className={fieldClass(!!errors.name)}
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            ელ-ფოსტა <span className="text-destructive">*</span>
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={fieldClass(!!errors.email)}
          />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-sm font-medium">
          თემა <span className="text-destructive">*</span>
        </label>
        <select
          {...register('subject')}
          id="subject"
          className={fieldClass(!!errors.subject)}
          defaultValue=""
        >
          <option value="" disabled>
            აირჩიეთ თემა
          </option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.subject && <p className="text-destructive text-xs">{errors.subject.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          შეტყობინება <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={5}
          placeholder="დაწერეთ თქვენი შეტყობინება..."
          className={fieldClass(!!errors.message)}
        />
        {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'გაგზავნა...' : 'გაგზავნა'}
      </Button>
    </form>
  );
}
