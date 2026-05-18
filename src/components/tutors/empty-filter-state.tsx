'use client';

import { useFilters } from '@/hooks/use-filters';

export function EmptyFilterState() {
  const { apply } = useFilters();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="text-5xl">🔍</div>
      <p className="text-foreground text-base font-medium">ფილტრებს არ შეესაბამება ექსპერტი</p>
      <button
        onClick={() => apply({ categories: [], sort: 'rating', page: 1 })}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
      >
        ფილტრების გასუფთავება
      </button>
    </div>
  );
}
