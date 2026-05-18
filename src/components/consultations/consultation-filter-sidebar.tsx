'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CategoryOption } from '@/server/actions/tutors/fetch-tutors';
import type { ConsultationFilters } from '@/server/actions/consultations/fetch-consultations';

interface ConsultationFilterSidebarProps {
  categories: CategoryOption[];
  initialFilters: ConsultationFilters;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'ახალი' },
  { value: 'price_asc', label: 'ფასი: იაფიდან ძვირამდე' },
  { value: 'price_desc', label: 'ფასი: ძვირიდან იაფამდე' },
] as const;

export function ConsultationFilterSidebar({
  categories,
  initialFilters,
}: ConsultationFilterSidebarProps) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.category ?? '');
  const [priceMin, setPriceMin] = useState<string>(
    initialFilters.priceMin !== undefined ? String(initialFilters.priceMin) : '',
  );
  const [priceMax, setPriceMax] = useState<string>(
    initialFilters.priceMax !== undefined ? String(initialFilters.priceMax) : '',
  );
  const [sort, setSort] = useState<ConsultationFilters['sort']>(initialFilters.sort ?? 'newest');

  function buildParams(overrides: Partial<ConsultationFilters> = {}) {
    const merged: ConsultationFilters = {
      category: selectedCategory || undefined,
      priceMin: priceMin !== '' ? Number(priceMin) : undefined,
      priceMax: priceMax !== '' ? Number(priceMax) : undefined,
      sort: sort ?? 'newest',
      page: 1,
      ...overrides,
    };

    const params = new URLSearchParams();
    if (merged.category) params.set('category', merged.category);
    if (merged.priceMin !== undefined) params.set('priceMin', String(merged.priceMin));
    if (merged.priceMax !== undefined) params.set('priceMax', String(merged.priceMax));
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort);
    if (merged.page && merged.page > 1) params.set('page', String(merged.page));
    return params.toString();
  }

  function navigate(overrides: Partial<ConsultationFilters> = {}) {
    const query = buildParams(overrides);
    router.push(`/consultations${query ? `?${query}` : ''}`);
  }

  function toggleCategory(slug: string) {
    const next = selectedCategory === slug ? '' : slug;
    setSelectedCategory(next);
    navigate({ category: next || undefined, page: 1 });
  }

  function applySort(value: ConsultationFilters['sort']) {
    setSort(value);
    navigate({ sort: value, page: 1 });
  }

  function applyPrice() {
    navigate({ page: 1 });
  }

  function clearAll() {
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
    setSort('newest');
    router.push('/consultations');
  }

  const hasFilters =
    selectedCategory !== '' || priceMin !== '' || priceMax !== '' || sort !== 'newest';

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
          value={sort ?? 'newest'}
          onChange={(e) => applySort(e.target.value as ConsultationFilters['sort'])}
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
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.slug}
                  onChange={() => toggleCategory(cat.slug)}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-foreground text-sm">{cat.name}</span>
              </label>
            ))}
            {selectedCategory !== '' && (
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => toggleCategory('')}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-muted-foreground text-sm">ყველა</span>
              </label>
            )}
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
    </aside>
  );
}
