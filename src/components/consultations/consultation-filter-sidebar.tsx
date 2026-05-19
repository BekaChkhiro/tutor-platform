'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ConsultationSortOption } from '@/lib/consultations/fetch-consultations';

interface Category {
  slug: string;
  name: string;
}

interface ConsultationFilterSidebarProps {
  categories: Category[];
  activeCategory: string;
  activeSort: ConsultationSortOption;
  activePriceMin: string;
  activePriceMax: string;
}

const SORT_OPTIONS: { value: ConsultationSortOption; label: string }[] = [
  { value: 'newest', label: 'ახალი' },
  { value: 'price_asc', label: 'ფასი ↑' },
  { value: 'price_desc', label: 'ფასი ↓' },
];

export function ConsultationFilterSidebar({
  categories,
  activeCategory,
  activeSort,
  activePriceMin,
  activePriceMax,
}: ConsultationFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/consultations?${params.toString()}`);
  }

  function clearAll() {
    router.push('/consultations');
  }

  const hasFilters = activeCategory || activeSort !== 'newest' || activePriceMin || activePriceMax;

  return (
    <aside aria-label="ფილტრები" className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">ფილტრები</h2>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              გასუფთავება
            </button>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            კატეგორია
          </h3>
          <ul className="space-y-1" role="list">
            <li>
              <button
                onClick={() => update('category', '')}
                className={cn(
                  'w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                  !activeCategory
                    ? 'bg-foreground text-background font-medium'
                    : 'hover:bg-muted text-foreground',
                )}
              >
                ყველა
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => update('category', cat.slug)}
                  className={cn(
                    'w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                    activeCategory === cat.slug
                      ? 'bg-foreground text-background font-medium'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            ფასის დიაპაზონი (₾)
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="მინ"
              defaultValue={activePriceMin}
              onBlur={(e) => update('priceMin', e.target.value)}
              className="border-border w-full rounded-lg border px-2 py-1.5 text-sm focus:ring-1 focus:ring-black/20 focus:outline-none"
              aria-label="მინიმალური ფასი"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <input
              type="number"
              min={0}
              placeholder="მაქს"
              defaultValue={activePriceMax}
              onBlur={(e) => update('priceMax', e.target.value)}
              className="border-border w-full rounded-lg border px-2 py-1.5 text-sm focus:ring-1 focus:ring-black/20 focus:outline-none"
              aria-label="მაქსიმალური ფასი"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            დალაგება
          </h3>
          <ul className="space-y-1" role="list">
            {SORT_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  onClick={() => update('sort', opt.value)}
                  className={cn(
                    'w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                    activeSort === opt.value
                      ? 'bg-foreground text-background font-medium'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
