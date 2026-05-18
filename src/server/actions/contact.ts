'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/send';
import { ContactNotification } from '@/lib/email/templates/ContactNotification';
import type { ContactSubject } from '@/lib/contact-subjects';
import type { ActionResult } from './auth/register';

export type { ContactSubject };

// In-memory rate limit store: IP → submission timestamps
// Suitable for development; replace with Upstash/Redis in production.
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitStore.get(ip) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX) return false;

  rateLimitStore.set(ip, [...timestamps, now]);
  return true;
}

async function verifyHcaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    // Allow submissions in dev when secret is not configured
    if (process.env.NODE_ENV !== 'production') return true;
    console.error('[contact] HCAPTCHA_SECRET is not set');
    return false;
  }

  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export interface ContactFormInput {
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  hcaptchaToken: string;
}

export async function submitContactForm(input: ContactFormInput): Promise<ActionResult> {
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return {
      success: false,
      error: 'Too many submissions. Please wait a few minutes and try again.',
    };
  }

  const { name, email, subject, message, hcaptchaToken } = input;

  if (!name.trim() || !email.trim() || !subject || !message.trim() || !hcaptchaToken) {
    return { success: false, error: 'All fields are required.' };
  }

  if (message.trim().length < 10) {
    return { success: false, error: 'Message must be at least 10 characters.' };
  }

  const captchaOk = await verifyHcaptcha(hcaptchaToken);
  if (!captchaOk) {
    return { success: false, error: 'CAPTCHA verification failed. Please try again.' };
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      subject,
      contactName: name.trim(),
      contactEmail: email.trim().toLowerCase(),
      body: message.trim(),
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM ?? 'admin@tutorplatform.ge';

  try {
    await sendEmail({
      template: ContactNotification,
      to: adminEmail,
      subject: `[Contact] ${subject} — ${name}`,
      props: {
        contactName: name.trim(),
        contactEmail: email.trim(),
        subject,
        message: message.trim(),
        ticketId: ticket.id,
      },
    });
  } catch (err) {
    // Ticket was created — don't fail the user if email delivery fails
    console.error('[contact] admin notification failed', { ticketId: ticket.id, err });
  }

  return { success: true, data: undefined };
}
