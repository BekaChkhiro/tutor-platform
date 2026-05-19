'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/lib/tutors/fetch-tutors';

interface Category {
  slug: string;
  name: string;
}

interface FilterSidebarProps {
  categories: Category[];
  activeCategory: string;
  activeSort: SortOption;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'ახალი' },
  { value: 'rating', label: 'რეიტინგი' },
  { value: 'price_asc', label: 'ფასი ↑' },
  { value: 'price_desc', label: 'ფასი ↓' },
];

export function FilterSidebar({ categories, activeCategory, activeSort }: FilterSidebarProps) {
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
    router.push(`/tutors?${params.toString()}`);
  }

  function clearAll() {
    router.push('/tutors');
  }

  const hasFilters = activeCategory || activeSort !== 'newest';

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
