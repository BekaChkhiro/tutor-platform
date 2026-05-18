'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useFilters } from '@/hooks/use-filters';
import type { ParsedFilters, TutorFilters } from '@/hooks/use-filters';
import type { CategoryOption } from '@/server/actions/tutors/fetch-tutors';

interface FilterSidebarProps {
  categories: CategoryOption[];
  initialFilters: ParsedFilters;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'რეიტინგი' },
  { value: 'price_asc', label: 'ფასი: იაფიდან ძვირამდე' },
  { value: 'price_desc', label: 'ფასი: ძვირიდან იაფამდე' },
  { value: 'newest', label: 'ახალი' },
] as const;

const RATING_OPTIONS = [5, 4, 3] as const;

export function FilterSidebar({ categories, initialFilters }: FilterSidebarProps) {
  const { apply } = useFilters();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories);
  const [priceMin, setPriceMin] = useState<string>(
    initialFilters.priceMin !== undefined ? String(initialFilters.priceMin) : '',
  );
  const [priceMax, setPriceMax] = useState<string>(
    initialFilters.priceMax !== undefined ? String(initialFilters.priceMax) : '',
  );
  const [rating, setRating] = useState<string>(
    initialFilters.rating !== undefined ? String(initialFilters.rating) : '',
  );
  const [sort, setSort] = useState<TutorFilters['sort']>(initialFilters.sort);

  function buildFilters(): TutorFilters {
    return {
      categories: selectedCategories,
      priceMin: priceMin !== '' ? Number(priceMin) : undefined,
      priceMax: priceMax !== '' ? Number(priceMax) : undefined,
      rating: rating !== '' ? Number(rating) : undefined,
      sort: sort ?? 'rating',
      page: 1,
    };
  }

  function toggleCategory(slug: string) {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(next);
    apply({ ...buildFilters(), categories: next, page: 1 });
  }

  function applySort(value: TutorFilters['sort']) {
    setSort(value);
    apply({ ...buildFilters(), sort: value, page: 1 });
  }

  function applyRating(value: string) {
    setRating(value);
    apply({ ...buildFilters(), rating: value !== '' ? Number(value) : undefined, page: 1 });
  }

  function applyPrice() {
    apply({ ...buildFilters(), page: 1 });
  }

  function clearAll() {
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setRating('');
    setSort('rating');
    apply({ categories: [], sort: 'rating', page: 1 });
  }

  const hasFilters =
    selectedCategories.length > 0 ||
    priceMin !== '' ||
    priceMax !== '' ||
    rating !== '' ||
    sort !== 'rating';

  return (
    <aside className="hidden w-56 shrink-0 space-y-6 lg:block">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold">ფილტრები</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-primary text-xs underline-offset-2 hover:underline"
          >
            გასუფთავება
          </button>
        )}
      </div>

      {/* Sort */}
      <section>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
          დალაგება
        </p>
        <select
          value={sort ?? 'rating'}
          onChange={(e) => applySort(e.target.value as TutorFilters['sort'])}
          className="border-border bg-background text-foreground focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            კატეგორია
          </p>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleCategory(cat.slug)}
                  className="border-border accent-primary h-4 w-4 rounded"
                />
                <span className="text-foreground text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Price range */}
      <section>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
          ფასი (₾)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="დან"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={applyPrice}
            className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            min={0}
            placeholder="მდე"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={applyPrice}
            className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </section>

      {/* Rating */}
      <section>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
          მინიმალური რეიტინგი
        </p>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="rating"
                value={r}
                checked={rating === String(r)}
                onChange={() => applyRating(String(r))}
                className="accent-primary h-4 w-4"
              />
              <span className="text-foreground text-sm">
                {'★'.repeat(r)}
                {'☆'.repeat(5 - r)} {r}+
              </span>
            </label>
          ))}
          {rating !== '' && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="rating"
                value=""
                checked={rating === ''}
                onChange={() => applyRating('')}
                className="accent-primary h-4 w-4"
              />
              <span
                className={cn(
                  'text-sm',
                  rating === '' ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                ყველა
              </span>
            </label>
          )}
        </div>
      </section>
    </aside>
  );
}
