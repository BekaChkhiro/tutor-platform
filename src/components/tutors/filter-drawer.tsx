'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFilters } from '@/hooks/use-filters';
import type { ParsedFilters, TutorFilters } from '@/hooks/use-filters';
import type { CategoryOption } from '@/server/actions/tutors/fetch-tutors';

interface FilterDrawerProps {
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

export function FilterDrawer({ categories, initialFilters }: FilterDrawerProps) {
  const { apply } = useFilters();
  const [open, setOpen] = useState(false);

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

  function handleApply() {
    apply({
      categories: selectedCategories,
      priceMin: priceMin !== '' ? Number(priceMin) : undefined,
      priceMax: priceMax !== '' ? Number(priceMax) : undefined,
      rating: rating !== '' ? Number(rating) : undefined,
      sort: sort ?? 'rating',
      page: 1,
    });
    setOpen(false);
  }

  function handleClear() {
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setRating('');
    setSort('rating');
  }

  const hasFilters =
    selectedCategories.length > 0 ||
    priceMin !== '' ||
    priceMax !== '' ||
    rating !== '' ||
    (sort && sort !== 'rating');

  const activeCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (priceMin !== '' || priceMax !== '' ? 1 : 0) +
    (rating !== '' ? 1 : 0) +
    (sort && sort !== 'rating' ? 1 : 0);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="border-border bg-background hover:bg-muted flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
        aria-label="ფილტრები"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>ფილტრები</span>
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ფილტრები"
        className={cn(
          'bg-background fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl shadow-xl transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 pb-3">
          <h2 className="text-base font-semibold">ფილტრები</h2>
          <button
            onClick={() => setOpen(false)}
            className="hover:bg-muted rounded-lg p-1"
            aria-label="დახურვა"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          {/* Sort */}
          <section>
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              დალაგება
            </p>
            <select
              value={sort ?? 'rating'}
              onChange={(e) => setSort(e.target.value as TutorFilters['sort'])}
              className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() =>
                        setSelectedCategories((prev) =>
                          prev.includes(cat.slug)
                            ? prev.filter((c) => c !== cat.slug)
                            : [...prev, cat.slug],
                        )
                      }
                      className="border-border accent-primary h-4 w-4 rounded"
                    />
                    <span className="text-sm">{cat.name}</span>
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
                className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                min={0}
                placeholder="მდე"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="border-border bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </section>

          {/* Rating */}
          <section>
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              მინიმალური რეიტინგი
            </p>
            <div className="space-y-2">
              {RATING_OPTIONS.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="drawer-rating"
                    value={r}
                    checked={rating === String(r)}
                    onChange={() => setRating(String(r))}
                    className="accent-primary h-4 w-4"
                  />
                  <span className="text-sm">
                    {'★'.repeat(r)}
                    {'☆'.repeat(5 - r)} {r}+
                  </span>
                </label>
              ))}
              {rating !== '' && (
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="drawer-rating"
                    value=""
                    checked={rating === ''}
                    onChange={() => setRating('')}
                    className="accent-primary h-4 w-4"
                  />
                  <span className="text-muted-foreground text-sm">ყველა</span>
                </label>
              )}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="border-border flex gap-3 border-t px-4 py-4">
          {hasFilters && (
            <button
              onClick={handleClear}
              className="border-border hover:bg-muted flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors"
            >
              გასუფთავება
            </button>
          )}
          <button
            onClick={handleApply}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            გამოყენება
          </button>
        </div>
      </div>
    </div>
  );
}
