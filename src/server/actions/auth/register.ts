'use server';

import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/send';
import { VerifyEmail } from '@/lib/email/templates/VerifyEmail';
import {
  userRegistrationSchema,
  tutorRegistrationSchema,
  completeProfileSchema,
} from '@/lib/validators/registration';

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function generateVerifyToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

function verifyUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  return `${base}/verify-email?token=${token}`;
}

async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const url = verifyUrl(token);
  await sendEmail({
    to: email,
    subject: 'Verify your email — Tutor',
    template: VerifyEmail,
    props: { url },
  });
}

export async function registerUser(raw: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = userRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { firstName, lastName, email, phone, dob, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      dob,
      passwordHash,
      role: 'USER',
    },
  });

  const token = await generateVerifyToken(email);
  await sendVerificationEmail(email, token);

  return { success: true, data: { email } };
}

export async function registerTutor(raw: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = tutorRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { firstName, lastName, email, phone, dob, gender, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now()}`;

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      dob,
      passwordHash,
      role: 'TUTOR',
      tutor: {
        create: {
          slug,
          gender,
          status: 'PENDING_REVIEW',
        },
      },
    },
  });

  const token = await generateVerifyToken(email);
  await sendVerificationEmail(email, token);

  return { success: true, data: { email } };
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return { success: false, error: 'Invalid or expired verification link.' };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: record.identifier, token } },
    });
    return { success: false, error: 'This link has expired. Please register again.' };
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token } },
  });

  return { success: true, data: undefined };
}

export async function completeProfile(userId: string, raw: unknown): Promise<ActionResult> {
  const parsed = completeProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { phone, dob, gender } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: { phone, dob },
  });

  if (gender) {
    await prisma.tutor.updateMany({
      where: { userId },
      data: { gender },
    });
  }

  return { success: true, data: undefined };
}
