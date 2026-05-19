'use server';

import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/send';
import { TutorSubmittedForReview } from '@/lib/email/templates/TutorSubmittedForReview';
import { auth } from '@/lib/auth/auth';
import { step1Schema, step3Schema, step4Schema, step5Schema } from '@/lib/validators/onboarding';

export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function getAuthedTutor() {
  const session = await auth();
  if (!session || session.user.role !== 'TUTOR') {
    return { session: null, tutor: null };
  }
  const tutor = await prisma.tutor.findUnique({
    where: { userId: session.user.id },
    select: { id: true, onboardingStep: true, onboardingComplete: true, status: true },
  });
  return { session, tutor };
}

export async function loadOnboardingData(userId: string) {
  return prisma.tutor.findUnique({
    where: { userId },
    include: {
      skills: { select: { name: true } },
      certificates: { select: { title: true, issuer: true, issuedAt: true } },
      educations: {
        select: {
          institution: true,
          degree: true,
          fieldOfStudy: true,
          startYear: true,
          endYear: true,
        },
      },
      experiences: {
        select: { company: true, role: true, startYear: true, endYear: true, description: true },
      },
      categories: { select: { categoryId: true } },
    },
  });
}

export async function saveStep1(raw: unknown): Promise<ActionResult> {
  const parsed = step1Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { session, tutor } = await getAuthedTutor();
  if (!session || !tutor) return { success: false, error: 'Unauthorized' };
  if (tutor.onboardingComplete && tutor.status !== 'REJECTED') {
    return { success: false, error: 'Application is under review' };
  }

  await prisma.tutor.update({
    where: { userId: session.user.id },
    data: {
      headline: parsed.data.headline,
      bio: parsed.data.bio,
      onboardingStep: Math.max(tutor.onboardingStep, 2),
    },
  });

  return { success: true, data: undefined };
}

export async function saveStep3(raw: unknown): Promise<ActionResult> {
  const parsed = step3Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { session, tutor } = await getAuthedTutor();
  if (!session || !tutor) return { success: false, error: 'Unauthorized' };
  if (tutor.onboardingComplete && tutor.status !== 'REJECTED') {
    return { success: false, error: 'Application is under review' };
  }

  await prisma.$transaction([
    prisma.skill.deleteMany({ where: { tutorId: tutor.id } }),
    prisma.skill.createMany({
      data: parsed.data.skills.map((name) => ({ tutorId: tutor.id, name })),
    }),
    prisma.tutorCategory.deleteMany({ where: { tutorId: tutor.id } }),
    prisma.tutorCategory.createMany({
      data: [...new Set(parsed.data.categoryIds)].map((categoryId) => ({
        tutorId: tutor.id,
        categoryId,
      })),
    }),
    prisma.tutor.update({
      where: { id: tutor.id },
      data: { onboardingStep: Math.max(tutor.onboardingStep, 4) },
    }),
  ]);

  return { success: true, data: undefined };
}

export async function saveStep4(raw: unknown): Promise<ActionResult> {
  const parsed = step4Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { session, tutor } = await getAuthedTutor();
  if (!session || !tutor) return { success: false, error: 'Unauthorized' };
  if (tutor.onboardingComplete && tutor.status !== 'REJECTED') {
    return { success: false, error: 'Application is under review' };
  }

  await prisma.$transaction([
    prisma.education.deleteMany({ where: { tutorId: tutor.id } }),
    ...(parsed.data.educations.length > 0
      ? [
          prisma.education.createMany({
            data: parsed.data.educations.map((e) => ({
              tutorId: tutor.id,
              institution: e.institution,
              degree: e.degree ?? null,
              fieldOfStudy: e.fieldOfStudy ?? null,
              startYear: e.startYear ?? null,
              endYear: e.endYear ?? null,
            })),
          }),
        ]
      : []),
    prisma.experience.deleteMany({ where: { tutorId: tutor.id } }),
    ...(parsed.data.experiences.length > 0
      ? [
          prisma.experience.createMany({
            data: parsed.data.experiences.map((e) => ({
              tutorId: tutor.id,
              company: e.company,
              role: e.role,
              startYear: e.startYear ?? null,
              endYear: e.endYear ?? null,
              description: e.description ?? null,
            })),
          }),
        ]
      : []),
    prisma.tutor.update({
      where: { id: tutor.id },
      data: { onboardingStep: Math.max(tutor.onboardingStep, 5) },
    }),
  ]);

  return { success: true, data: undefined };
}

export async function saveStep5(raw: unknown): Promise<ActionResult> {
  const parsed = step5Schema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { session, tutor } = await getAuthedTutor();
  if (!session || !tutor) return { success: false, error: 'Unauthorized' };
  if (tutor.onboardingComplete && tutor.status !== 'REJECTED') {
    return { success: false, error: 'Application is under review' };
  }

  await prisma.$transaction([
    prisma.certificate.deleteMany({ where: { tutorId: tutor.id } }),
    ...(parsed.data.certificates.length > 0
      ? [
          prisma.certificate.createMany({
            data: parsed.data.certificates.map((c) => ({
              tutorId: tutor.id,
              title: c.title,
              issuer: c.issuer ?? null,
              issuedAt: c.issuedAt ? new Date(c.issuedAt) : null,
            })),
          }),
        ]
      : []),
    prisma.tutor.update({
      where: { id: tutor.id },
      data: { onboardingStep: Math.max(tutor.onboardingStep, 6) },
    }),
  ]);

  return { success: true, data: undefined };
}

export async function submitForReview(): Promise<ActionResult> {
  const { session, tutor } = await getAuthedTutor();
  if (!session || !tutor) return { success: false, error: 'Unauthorized' };
  if (tutor.onboardingComplete && tutor.status !== 'REJECTED') {
    return { success: false, error: 'Application is already under review' };
  }

  const tutorWithUser = await prisma.tutor.findUnique({
    where: { id: tutor.id },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!tutorWithUser) return { success: false, error: 'Tutor not found' };

  if (!tutorWithUser.headline?.trim() || !tutorWithUser.bio?.trim()) {
    return { success: false, error: 'Complete step 1 (headline and bio) before submitting.' };
  }

  await prisma.tutor.update({
    where: { id: tutor.id },
    data: { onboardingComplete: true, onboardingStep: 6 },
  });

  const tutorName =
    [tutorWithUser.user.firstName, tutorWithUser.user.lastName].filter(Boolean).join(' ') ||
    'Unknown';
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@tutorplatform.ge';
  const adminUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/admin/tutors`;

  await sendEmail({
    to: adminEmail,
    subject: `New tutor application: ${tutorName}`,
    template: TutorSubmittedForReview,
    props: { tutorName, tutorEmail: tutorWithUser.user.email, adminUrl },
  });

  return { success: true, data: undefined };
}
