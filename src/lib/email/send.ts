import React from 'react';
import { getResend } from './client';

const FROM = process.env.EMAIL_FROM ?? 'no-reply@tutorplatform.ge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendEmail<TProps extends Record<string, any>>({
  template: Template,
  to,
  subject,
  props,
}: {
  template: React.ComponentType<TProps>;
  to: string | string[];
  subject: string;
  props: TProps;
}): Promise<void> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject,
      react: React.createElement(Template, props),
    });

    if (error) {
      // TODO: replace with error-tracker breadcrumb once T1.8 tooling is decided
      console.error('[email] send failed', { to, subject, error });
      throw new Error(`Email send failed: ${error.message}`);
    }
  } catch (err) {
    console.error('[email] unexpected error', { to, subject, err });
    throw err;
  }
}
