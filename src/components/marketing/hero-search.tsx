'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface TutorHit {
  slug: string;
  headline: string | null;
  user: { firstName: string | null; lastName: string | null };
}

interface CategoryHit {
  slug: string;
  name: string;
}

interface SearchResults {
  tutors: TutorHit[];
  categories: CategoryHit[];
}

type SearchItem = { href: string; label: string; sub?: string };

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const allItems: SearchItem[] = [
    ...(results?.categories.map((c) => ({
      href: `/tutors?category=${c.slug}`,
      label: c.name,
    })) ?? []),
    ...(results?.tutors.map((t) => ({
      href: `/tutors/${t.slug}`,
      label: [t.user.firstName, t.user.lastName].filter(Boolean).join(' ') || t.slug,
      sub: t.headline ?? undefined,
    })) ?? []),
  ];

  const hasResults = allItems.length > 0;
  const showEmpty = open && query.length >= 2 && !hasResults;
  const showList = open && (hasResults || showEmpty);

  function handleQueryChange(next: string) {
    setQuery(next);
    setActiveIndex(-1);
    setOpen(next.length >= 2);
    clearTimeout(timerRef.current);
    if (next.length < 2) {
      setResults(null);
      return;
    }
    timerRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(next)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: SearchResults | null) => {
          if (data) setResults(data);
        })
        .catch(() => null);
    }, 300);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timerRef.current);
    };
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) {
      if (e.key === 'Enter' && query.trim()) {
        router.push(`/tutors?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          const item = allItems[activeIndex];
          if (item) {
            router.push(item.href);
            setOpen(false);
          }
        } else if (query.trim()) {
          router.push(`/tutors?q=${encodeURIComponent(query.trim())}`);
          setOpen(false);
        }
        break;
      case 'Escape':
        setOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  const listboxId = 'hero-search-listbox';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search
          className="text-muted-foreground pointer-events-none absolute left-4 size-5"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `hero-search-item-${activeIndex}` : undefined}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="გიპოვე ექსპერტი ან კატეგორია..."
          className="border-border bg-background w-full rounded-xl border py-4 pr-36 pl-12 text-sm shadow-sm focus:ring-2 focus:ring-black/20 focus:outline-none md:text-base"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => {
            if (query.trim()) router.push(`/tutors?q=${encodeURIComponent(query.trim())}`);
          }}
          className="absolute right-2 rounded-lg bg-[var(--coral)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--coral)]/50 focus:outline-none"
        >
          ძებნა
        </button>
      </div>

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="ძებნის შედეგები"
          className="border-border bg-background absolute z-50 mt-1 w-full overflow-hidden rounded-xl border shadow-lg"
        >
          {showEmpty ? (
            <li
              role="option"
              aria-selected="false"
              className="text-muted-foreground px-4 py-3 text-sm"
            >
              შედეგი ვერ მოიძებნა
            </li>
          ) : (
            allItems.map((item, i) => (
              <li
                key={item.href}
                id={`hero-search-item-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                  i === activeIndex ? 'bg-muted' : 'hover:bg-muted/60'
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{item.label}</span>
                {item.sub && <span className="text-muted-foreground ml-2 text-xs">{item.sub}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
