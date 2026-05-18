import { requireUser } from '@/lib/auth/guards';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
