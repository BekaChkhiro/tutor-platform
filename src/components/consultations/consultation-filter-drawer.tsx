'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConsultationSortOption } from '@/lib/consultations/fetch-consultations';

interface Category {
  slug: string;
  name: string;
}

interface ConsultationFilterDrawerProps {
  categories: Category[];
  activeCategory: string;
  activeSort: ConsultationSortOption;
  activePriceMin: string;
  activePriceMax: string;
  total: number;
}

const SORT_OPTIONS: { value: ConsultationSortOption; label: string }[] = [
  { value: 'newest', label: 'ახალი' },
  { value: 'price_asc', label: 'ფასი ↑' },
  { value: 'price_desc', label: 'ფასი ↓' },
];

export function ConsultationFilterDrawer({
  categories,
  activeCategory,
  activeSort,
  activePriceMin,
  activePriceMax,
  total,
}: ConsultationFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pendingCategory, setPendingCategory] = useState(activeCategory);
  const [pendingSort, setPendingSort] = useState(activeSort);
  const [pendingPriceMin, setPendingPriceMin] = useState(activePriceMin);
  const [pendingPriceMax, setPendingPriceMax] = useState(activePriceMax);

  function handleOpen() {
    setPendingCategory(activeCategory);
    setPendingSort(activeSort);
    setPendingPriceMin(activePriceMin);
    setPendingPriceMax(activePriceMax);
    setOpen(true);
  }

  function handleApply() {
    const params = new URLSearchParams(searchParams.toString());
    if (pendingCategory) params.set('category', pendingCategory);
    else params.delete('category');
    if (pendingSort !== 'newest') params.set('sort', pendingSort);
    else params.delete('sort');
    if (pendingPriceMin) params.set('priceMin', pendingPriceMin);
    else params.delete('priceMin');
    if (pendingPriceMax) params.set('priceMax', pendingPriceMax);
    else params.delete('priceMax');
    params.delete('page');
    router.push(`/consultations?${params.toString()}`);
    setOpen(false);
  }

  function handleClear() {
    setPendingCategory('');
    setPendingSort('newest');
    setPendingPriceMin('');
    setPendingPriceMax('');
  }

  const hasFilters = activeCategory || activeSort !== 'newest' || activePriceMin || activePriceMax;

  return (
    <div className="lg:hidden">
      <button
        onClick={handleOpen}
        className={cn(
          'border-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
          hasFilters ? 'bg-foreground text-background border-foreground' : 'hover:bg-muted',
        )}
        aria-expanded={open}
        aria-controls="consultation-filter-drawer"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        ფილტრი
        {hasFilters && (
          <span className="flex size-5 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
            {
              [activeCategory, activeSort !== 'newest', activePriceMin, activePriceMax].filter(
                Boolean,
              ).length
            }
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            id="consultation-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="ფილტრები"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-6 shadow-xl"
            style={{ maxHeight: '80dvh', overflowY: 'auto' }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">ფილტრები</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="დახურვა"
                className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                კატეგორია
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPendingCategory('')}
                  className={cn(
                    'rounded-full px-3 py-1 text-sm transition-colors',
                    !pendingCategory
                      ? 'bg-foreground text-background font-medium'
                      : 'border-border border hover:bg-gray-50',
                  )}
                >
                  ყველა
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setPendingCategory(cat.slug)}
                    className={cn(
                      'rounded-full px-3 py-1 text-sm transition-colors',
                      pendingCategory === cat.slug
                        ? 'bg-foreground text-background font-medium'
                        : 'border-border border hover:bg-gray-50',
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                ფასის დიაპაზონი (₾)
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  placeholder="მინ"
                  value={pendingPriceMin}
                  onChange={(e) => setPendingPriceMin(e.target.value)}
                  className="border-border w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-black/20 focus:outline-none"
                  aria-label="მინიმალური ფასი"
                />
                <span className="text-muted-foreground text-sm">—</span>
                <input
                  type="number"
                  min={0}
                  placeholder="მაქს"
                  value={pendingPriceMax}
                  onChange={(e) => setPendingPriceMax(e.target.value)}
                  className="border-border w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-black/20 focus:outline-none"
                  aria-label="მაქსიმალური ფასი"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                დალაგება
              </h3>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPendingSort(opt.value)}
                    className={cn(
                      'rounded-full px-3 py-1 text-sm transition-colors',
                      pendingSort === opt.value
                        ? 'bg-foreground text-background font-medium'
                        : 'border-border border hover:bg-gray-50',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClear}
                className="border-border flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                გასუფთავება
              </button>
              <button
                onClick={handleApply}
                className="bg-foreground text-background flex-1 rounded-lg py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
              >
                {total} კონსულტაციის ნახვა
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
