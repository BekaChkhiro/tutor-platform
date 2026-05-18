'use server';

import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/send';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validators/password-reset';
import type { ActionResult } from './register';

// ─── In-memory rate limiter: 5 requests / hour / IP ────────────────────────
const resetAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = resetAttempts.get(ip);

  if (!entry || entry.resetAt <= now) {
    resetAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) return false;

  entry.count += 1;
  return true;
}

// ─── Token helpers ──────────────────────────────────────────────────────────

const RESET_PREFIX = 'reset:';

function resetIdentifier(email: string) {
  return `${RESET_PREFIX}${email}`;
}

async function createResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  const identifier = resetIdentifier(email);

  // Delete any existing reset token for this email before creating a new one
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

function resetUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  return `${base}/reset-password?token=${token}`;
}

async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const url = resetUrl(token);
  await sendEmail({
    to: email,
    subject: 'Reset your password — Tutor',
    html: `
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <p>The link expires in 1 hour.</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
}

// ─── Server actions ─────────────────────────────────────────────────────────

export async function requestPasswordReset(
  raw: unknown,
  ip = 'unknown',
): Promise<ActionResult<void>> {
  if (!checkRateLimit(ip)) {
    // Generic message — don't confirm whether the email exists
    return { success: true, data: undefined };
  }

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success — don't reveal whether the email is registered
  if (user) {
    const token = await createResetToken(email);
    await sendPasswordResetEmail(email, token);
  }

  return { success: true, data: undefined };
}

export async function resetPassword(raw: unknown): Promise<ActionResult<void>> {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { token, password } = parsed.data;

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || !record.identifier.startsWith(RESET_PREFIX)) {
    return { success: false, error: 'Invalid or expired reset link.' };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    });
    return { success: false, error: 'This link has expired. Please request a new one.' };
  }

  const email = record.identifier.slice(RESET_PREFIX.length);
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token } },
  });

  return { success: true, data: undefined };
}
