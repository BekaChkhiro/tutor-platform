interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn('[email] SMTP_HOST not set — email not sent to:', to, '| subject:', subject);
    return;
  }

  const fromAddress = process.env.EMAIL_FROM ?? 'noreply@tutorplatform.ge';

  // nodemailer is an optional peer dependency; install with: pnpm add nodemailer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodemailer: any = await import('nodemailer' as string);

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transport.sendMail({ from: fromAddress, to, subject, html });
}
