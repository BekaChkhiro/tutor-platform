'use client';

import { useEffect } from 'react';
import { Accordion } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FaqCategory } from '@/content/faq';

interface FaqAccordionProps {
  categories: FaqCategory[];
  deepLinkId?: string | null;
}

export function FaqAccordion({ categories, deepLinkId }: FaqAccordionProps) {
  const defaultValues = categories.reduce<Record<string, string[]>>((acc, cat) => {
    const match = deepLinkId ? cat.items.find((item) => item.id === deepLinkId) : null;
    acc[cat.id] = match ? [deepLinkId as string] : [];
    return acc;
  }, {});

  useEffect(() => {
    if (!deepLinkId) return;
    const el = document.getElementById(`item-${deepLinkId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [deepLinkId]);

  return (
    <div className="space-y-10">
      {categories.map((cat) => (
        <section key={cat.id} id={cat.id} aria-labelledby={`cat-heading-${cat.id}`}>
          <h2
            id={`cat-heading-${cat.id}`}
            className="mb-4 text-xl font-semibold tracking-tight text-neutral-900"
          >
            {cat.title}
          </h2>

          <Accordion.Root
            defaultValue={defaultValues[cat.id]}
            className="rounded-card divide-y divide-neutral-200 border border-neutral-200 bg-white"
          >
            {cat.items.map((item) => (
              <Accordion.Item key={item.id} value={item.id} id={`item-${item.id}`} className="px-5">
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left',
                      'text-body font-medium text-neutral-900',
                      'focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:outline-none',
                      'data-[panel-open]:text-primary-600',
                    )}
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className="size-4 shrink-0 text-neutral-400 transition-transform duration-200 data-[panel-open]:rotate-180"
                      aria-hidden="true"
                    />
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Panel className="text-body-sm overflow-hidden text-neutral-600">
                  <p className="pb-4 leading-relaxed">{item.answer}</p>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>
      ))}
    </div>
  );
}
