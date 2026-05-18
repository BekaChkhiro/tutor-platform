import type { Metadata } from 'next';
import Link from 'next/link';
import { faqCategories } from '@/content/faq';
import { FaqAccordion } from '@/components/ui/faq-accordion';

export const metadata: Metadata = {
  title: 'ხშირად დასმული კითხვები — Tutor',
  description:
    'გაეცანით ხშირად დასმულ კითხვებს Tutor პლატფორმის გამოყენების, სპეციალისტების, გადახდებისა და ვიდეო სესიების შესახებ.',
};

function buildFaqJsonLd() {
  const questions = faqCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  };
}

export default async function FaqPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const defaultOpen = q ? [q] : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }}
      />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">ხშირად დასმული კითხვები</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            ვერ იპოვეთ პასუხი?{' '}
            <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
              დაგვიკავშირდით
            </Link>
            .
          </p>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="FAQ კატეგორიები">
            {faqCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="border-border text-foreground hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              >
                {cat.title}
              </a>
            ))}
          </nav>
        </header>
        <FaqAccordion categories={faqCategories} defaultOpen={defaultOpen} />
      </main>
    </>
  );
}
