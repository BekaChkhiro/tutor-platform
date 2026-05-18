'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { submitContactForm } from '@/server/actions/contact';
import { CONTACT_SUBJECTS } from '@/lib/contact-subjects';
import type { ContactSubject } from '@/lib/contact-subjects';

const HCaptcha = dynamic(() => import('@hcaptcha/react-hcaptcha'), { ssr: false });

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<ContactSubject | ''>('');
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const sitekey =
    process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? '10000000-ffff-ffff-ffff-000000000001';

  function resetCaptcha() {
    setCaptchaToken(null);
    setCaptchaKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!subject) {
      setError('Please select a subject.');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    setLoading(true);

    try {
      const result = await submitContactForm({
        name,
        email,
        subject: subject as ContactSubject,
        message,
        hcaptchaToken: captchaToken,
      });

      if (!result.success) {
        setError(result.error);
        resetCaptcha();
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <div className="mb-3 text-3xl">✓</div>
        <h2 className="mb-2 text-lg font-semibold text-green-900">Message sent!</h2>
        <p className="text-sm text-green-700">
          Thank you for reaching out. We&rsquo;ll get back to you within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-subject" className="text-sm font-medium">
          Subject
        </label>
        <select
          id="contact-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value as ContactSubject)}
          className={cn(inputClass, 'cursor-pointer')}
        >
          <option value="" disabled>
            Select a subject…
          </option>
          {CONTACT_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your question or issue in detail…"
          className={cn(inputClass, 'resize-y')}
        />
      </div>

      <HCaptcha
        key={captchaKey}
        sitekey={sitekey}
        onVerify={(token) => setCaptchaToken(token)}
        onExpire={() => setCaptchaToken(null)}
        onError={() => {
          setCaptchaToken(null);
          setError('CAPTCHA failed to load. Please refresh and try again.');
        }}
      />

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
        {loading ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}

const inputClass = cn(
  'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
  'placeholder:text-muted-foreground',
  'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
);
