import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/contact-form';

export const metadata: Metadata = {
  title: 'კონტაქტი — Tutor',
  description: 'დაგვიკავშირდით ნებისმიერი კითხვით. ჩვენ სიამოვნებით დაგეხმარებით.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'კონტაქტი — Tutor',
    description: 'დაგვიკავშირდით ნებისმიერი კითხვით. ჩვენ სიამოვნებით დაგეხმარებით.',
    type: 'website',
    locale: 'ka_GE',
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-h2 font-semibold tracking-tight text-neutral-900">კონტაქტი</h1>
        <p className="text-body mt-2 text-neutral-600">
          კითხვა გაქვს ან პრობლემა შეგხვდა?{' '}
          <a href="/faq" className="text-primary-500 underline-offset-2 hover:underline">
            ხშირად დასმული კითხვები
          </a>{' '}
          შეიძლება დაგეხმაროს. თუ ვერ იპოვე პასუხი — მოგვწერე.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <aside className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              ელ-ფოსტა
            </h2>
            <a
              href="mailto:support@tutorplatform.ge"
              className="text-primary-500 mt-1 block text-sm hover:underline"
            >
              support@tutorplatform.ge
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              სამუშაო საათები
            </h2>
            <p className="mt-1 text-sm text-neutral-700">ორშაბათი — პარასკევი</p>
            <p className="text-sm text-neutral-700">10:00 — 18:00 (GET)</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">
              პასუხის დრო
            </h2>
            <p className="mt-1 text-sm text-neutral-700">
              ჩვეულებრივ 1–2 სამუშაო დღის განმავლობაში.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
