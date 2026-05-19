import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/guards';

export default async function DashboardPage() {
  const session = await requireUser();

  if (session.user.role === 'TUTOR' && !session.user.onboardingComplete) {
    redirect('/tutor/onboarding');
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground text-sm">Placeholder route.</p>
    </main>
  );
}
