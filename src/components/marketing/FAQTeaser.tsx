'use client';

import Link from 'next/link';
import { Accordion } from '@base-ui/react/accordion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqItems = [
  {
    id: 'what-is',
    question: 'რა არის Tutor პლატფორმა?',
    answer:
      'Tutor — ონლაინ მარკეტპლეისია, სადაც ნებისმიერ სფეროში ვერიფიცირებულ ექსპერტებთან კონსულტაციის ჩატარება შეიძლება. ვიდეოზარი, ჩეთი და ფაილების გაზიარება ხდება პლატფორმის შიგნით.',
  },
  {
    id: 'how-payment',
    question: 'გადახდა უსაფრთხოა?',
    answer:
      'კი. გამოიყენება TBC და BOG ბანკის ინტეგრაცია. თქვენი ბარათის ინფორმაცია არ ინახება ჩვენს სერვერებზე — ყველა ტრანზაქცია ბანკის gateway-ზე გადის.',
  },
  {
    id: 'cancel',
    question: 'შეიძლება კონსულტაციის გაუქმება?',
    answer:
      'კი, შეიძლება — სეანსამდე 24 საათით ადრე. ამ შემთხვევაში სრული თანხა უბრუნდება. 24 საათზე ნაკლები დრო დარჩენილია — თანხა არ ბრუნდება, მაგრამ შეიძლება გადავადება.',
  },
  {
    id: 'become-tutor',
    question: 'როგორ გავხდე ექსპერტი?',
    answer:
      'შეავსე განაცხადი "გახდი ექსპერტი" გვერდიდან. გამოგვიგზავნე CV ან LinkedIn, მოკლე ვიდეო-პრეზენტაცია. გადამოწმების შემდეგ (1-3 სამუშაო დღე) გახსნი სრულ პროფილს.',
  },
];

export function FAQTeaser() {
  return (
    <section className="bg-neutral-50 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">ხშირად დასმული კითხვები</h2>
        </div>

        <Accordion.Root className="divide-border border-border divide-y rounded-xl border bg-white">
          {faqItems.map((item) => (
            <Accordion.Item key={item.id} value={item.id}>
              <Accordion.Header>
                <Accordion.Trigger
                  className={cn(
                    'group/trigger flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4',
                    'text-left text-sm font-medium text-neutral-900',
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

        <div className="mt-6 text-center">
          <Link href="/faq" className="text-sm font-medium underline-offset-4 hover:underline">
            ყველა კითხვის ნახვა →
          </Link>
        </div>
      </div>
    </section>
  );
}
