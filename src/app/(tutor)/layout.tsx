import { requireApprovedTutor } from '@/lib/auth/guards';

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  await requireApprovedTutor();
  return <>{children}</>;
}
