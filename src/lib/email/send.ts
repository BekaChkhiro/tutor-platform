import * as React from 'react';
import { getResendClient } from './client';

interface SendEmailOptions<P extends Record<string, unknown>> {
  to: string;
  subject: string;
  template: React.ComponentType<P>;
  props: P;
}

export async function sendEmail<P extends Record<string, unknown>>({
  to,
  subject,
  template,
  props,
}: SendEmailOptions<P>): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to:', to);
    return;
  }

  const from = process.env.EMAIL_FROM ?? 'Tutor Platform <noreply@tutorplatform.ge>';
  const client = getResendClient();

  await client.emails.send({
    from,
    to,
    subject,
    react: React.createElement(template, props),
  });
}
