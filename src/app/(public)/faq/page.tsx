import type { Metadata } from 'next';
import { FAQ_CATEGORIES } from '@/content/faq';
import { FaqAccordion } from '@/components/faq/faq-accordion';

export const metadata: Metadata = {
  title: 'ხშირად დასმული კითხვები — Tutor',
  description:
    'პასუხები ყველაზე გავრცელებულ კითხვებზე: ექსპერტები, კონსულტაციები, გადახდა და ანგარიშის მართვა.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'ხშირად დასმული კითხვები — Tutor',
    description:
      'პასუხები ყველაზე გავრცელებულ კითხვებზე: ექსპერტები, კონსულტაციები, გადახდა და ანგარიშის მართვა.',
    type: 'website',
    locale: 'ka_GE',
  },
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function FaqPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const deepLinkId = q?.trim() || null;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="mb-10">
          <h1 className="text-h2 font-semibold tracking-tight text-neutral-900">
            ხშირად დასმული კითხვები
          </h1>
          <p className="text-body mt-2 text-neutral-600">
            ვერ პოულობ პასუხს? გვიკავშირდი{' '}
            <a href="/contact" className="text-primary-500 underline-offset-2 hover:underline">
              საკონტაქტო გვერდზე
            </a>
            .
          </p>
        </header>

        <nav aria-label="კატეგორიები" className="mb-10">
          <ul className="flex flex-wrap gap-2" role="list">
            {FAQ_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <a
                  href={`#${cat.id}`}
                  className="text-body-sm hover:border-primary-500 hover:text-primary-600 inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-1.5 font-medium text-neutral-700 transition-colors"
                >
                  {cat.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <FaqAccordion categories={FAQ_CATEGORIES} deepLinkId={deepLinkId} />
      </main>
    </>
  );
}
