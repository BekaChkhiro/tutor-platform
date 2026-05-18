'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TutorFilters } from '@/lib/utils/filters';

export interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: TutorFilters;
  onApply: (filters: TutorFilters) => void;
  availableCategories?: string[];
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  availableCategories,
}: FilterDrawerProps) {
  if (!open) return null;
  return (
    <FilterDrawerContent
      key="drawer"
      filters={filters}
      onClose={onClose}
      onApply={onApply}
      availableCategories={availableCategories ?? []}
    />
  );
}

interface ContentProps {
  filters: TutorFilters;
  onClose: () => void;
  onApply: (filters: TutorFilters) => void;
  availableCategories: string[];
}

function FilterDrawerContent({ filters, onClose, onApply, availableCategories }: ContentProps) {
  const [draft, setDraft] = useState<TutorFilters>(filters);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function toggleCategory(cat: string) {
    setDraft((prev) => {
      const existing = prev.categories ?? [];
      return {
        ...prev,
        categories: existing.includes(cat) ? existing.filter((c) => c !== cat) : [...existing, cat],
      };
    });
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function handleClear() {
    setDraft({});
  }

  return (
    <>
      <div
        className="bg-foreground/40 fixed inset-0 z-40"
        aria-hidden="true"
        onClick={onClose}
        data-testid="filter-drawer-backdrop"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filter tutors"
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900',
          'max-h-[85dvh] overflow-y-auto',
        )}
        data-testid="filter-drawer"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Filters</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {availableCategories.length > 0 && (
          <section aria-labelledby="filter-categories-label" className="mb-5">
            <h3 id="filter-categories-label" className="mb-2 text-sm font-medium">
              Categories
            </h3>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="filter-categories-label"
            >
              {availableCategories.map((cat) => {
                const selected = draft.categories?.includes(cat) ?? false;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    aria-pressed={selected}
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-muted',
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section aria-labelledby="filter-price-label" className="mb-5">
          <h3 id="filter-price-label" className="mb-2 text-sm font-medium">
            Price range (₾/hr)
          </h3>
          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="price-min">
              Minimum price
            </label>
            <input
              id="price-min"
              type="number"
              min={0}
              placeholder="Min"
              value={draft.priceMin ?? ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  priceMin: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="border-border w-20 rounded-lg border px-2 py-1.5 text-sm"
            />
            <span aria-hidden className="text-muted-foreground text-sm">
              –
            </span>
            <label className="sr-only" htmlFor="price-max">
              Maximum price
            </label>
            <input
              id="price-max"
              type="number"
              min={0}
              placeholder="Max"
              value={draft.priceMax ?? ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  priceMax: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="border-border w-20 rounded-lg border px-2 py-1.5 text-sm"
            />
          </div>
        </section>

        <section aria-labelledby="filter-rating-label" className="mb-6">
          <h3 id="filter-rating-label" className="mb-2 text-sm font-medium">
            Minimum rating
          </h3>
          <div className="flex gap-2" role="group" aria-labelledby="filter-rating-label">
            {[3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDraft((p) => ({ ...p, rating: p.rating === r ? undefined : r }))}
                aria-pressed={draft.rating === r}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  draft.rating === r
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:bg-muted',
                )}
              >
                {r}★+
              </button>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClear}>
            Clear all
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      </aside>
    </>
  );
}
