import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
