'use server';

import { headers } from 'next/headers';
import { sendEmail } from '@/lib/email/send';
import { ContactAdmin } from '@/lib/email/templates/ContactAdmin';
import { contactSchema } from '@/lib/validators/contact';
import type { ActionResult } from '@/server/actions/auth/register';

// In-memory rate limiter: 3 submissions / hour / IP
const contactAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    contactAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count += 1;
  return true;
}

export async function submitContactForm(raw: unknown): Promise<ActionResult<void>> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return {
      success: false,
      error: 'ძალიან ბევრი მოთხოვნა. გთხოვთ, ცოტა ხანში სცადოთ.',
    };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { name, email, subject, message } = parsed.data;
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM ?? 'admin@tutorplatform.ge';

  await sendEmail({
    to: adminEmail,
    subject: `[Contact] ${subject} — ${name}`,
    template: ContactAdmin,
    props: { name, email, subject, message },
  });

  return { success: true, data: undefined };
}
