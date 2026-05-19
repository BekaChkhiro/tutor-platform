import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireTutor } from '@/lib/auth/guards';
import { prisma } from '@/lib/db/prisma';
import { loadOnboardingData } from '@/server/actions/tutors/onboarding';
import { OnboardingWizard } from '@/components/tutor/onboarding/wizard';

export const metadata: Metadata = {
  title: 'Complete your profile — Tutor',
};

export default async function TutorOnboardingPage() {
  const session = await requireTutor();

  const data = await loadOnboardingData(session.user.id);
  if (!data) redirect('/dashboard');

  if (data.status === 'APPROVED') redirect('/tutor/dashboard');

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { sortOrder: 'asc' },
  });

  const initialData = {
    onboardingStep: data.onboardingStep,
    onboardingComplete: data.onboardingComplete,
    status: data.status,
    headline: data.headline,
    bio: data.bio,
    photoUrl: data.photoUrl,
    skills: data.skills,
    categories: data.categories,
    educations: data.educations,
    experiences: data.experiences,
    certificates: data.certificates.map((c) => ({
      title: c.title,
      issuer: c.issuer,
      issuedAt: c.issuedAt,
    })),
  };

  return <OnboardingWizard initialData={initialData} categories={categories} />;
}
