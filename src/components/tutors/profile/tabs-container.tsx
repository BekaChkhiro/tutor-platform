'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'about', label: 'შესახებ' },
  { id: 'consultations', label: 'კონსულტაციები' },
  { id: 'reviews', label: 'შეფასებები' },
  { id: 'calendar', label: 'კალენდარი' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface Props {
  aboutContent: React.ReactNode;
  consultationsContent: React.ReactNode;
  reviewsContent: React.ReactNode;
  reviewCount: number;
  consultationCount: number;
}

export function TabsContainer({
  aboutContent,
  consultationsContent,
  reviewsContent,
  reviewCount,
  consultationCount,
}: Props) {
  const [active, setActive] = useState<TabId>('about');

  return (
    <div>
      <nav
        className="border-border -mx-4 flex gap-0 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0"
        aria-label="Profile sections"
      >
        {TABS.map((tab) => {
          const badge =
            tab.id === 'consultations'
              ? consultationCount
              : tab.id === 'reviews'
                ? reviewCount
                : null;

          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              aria-selected={active === tab.id}
              role="tab"
              className={cn(
                'border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-4',
                active === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900',
              )}
            >
              {tab.label}
              {badge != null && badge > 0 && (
                <span
                  className={cn(
                    'ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs',
                    active === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-neutral-100 text-neutral-600',
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div role="tabpanel" className="pt-6">
        <div className={active !== 'about' ? 'hidden' : ''}>{aboutContent}</div>
        <div className={active !== 'consultations' ? 'hidden' : ''}>{consultationsContent}</div>
        <div className={active !== 'reviews' ? 'hidden' : ''}>{reviewsContent}</div>
        <div className={active !== 'calendar' ? 'hidden' : ''}>
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-400">კალენდარი მალე გამოჩნდება</p>
          </div>
        </div>
      </div>
    </div>
  );
}
