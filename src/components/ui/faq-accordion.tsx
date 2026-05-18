'use client';

import { Accordion } from '@base-ui/react/accordion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FaqCategory } from '@/content/faq';

interface FaqAccordionProps {
  categories: FaqCategory[];
  defaultOpen?: string[];
}

export function FaqAccordion({ categories, defaultOpen = [] }: FaqAccordionProps) {
  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section key={category.id} id={category.id}>
          <h2 className="mb-4 text-lg font-semibold">{category.title}</h2>
          <Accordion.Root
            defaultValue={defaultOpen.filter((id) => category.items.some((item) => item.id === id))}
            className="divide-border border-border divide-y rounded-xl border"
          >
            {category.items.map((item) => (
              <Accordion.Item key={item.id} value={item.id}>
                <Accordion.Header>
                  <Accordion.Trigger
                    className={cn(
                      'group/trigger flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4',
                      'text-foreground text-left text-sm font-medium',
                      'hover:bg-muted/50 transition-colors',
                      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
                      'data-[panel-open]:bg-muted/30',
                    )}
                  >
                    <span>{item.question}</span>
                    <ChevronDownIcon
                      className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[panel-open]/trigger:rotate-180"
                      aria-hidden
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="text-muted-foreground overflow-hidden text-sm data-[ending-style]:animate-none data-[starting-style]:animate-none">
                  <div className="px-5 pt-2 pb-4 leading-relaxed">{item.answer}</div>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>
      ))}
    </div>
  );
}
