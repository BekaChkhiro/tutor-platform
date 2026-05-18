import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';

const contactTitle = 'Contact Us';
const contactDescription =
  'Get in touch with the Tutor platform team. We respond to all inquiries within 1–2 business days.';

export const metadata: Metadata = {
  title: contactTitle,
  description: contactDescription,
  alternates: {
    canonical: '/contact',
    languages: { 'ka-GE': '/contact' },
  },
  openGraph: {
    type: 'website',
    siteName: 'Tutor',
    title: contactTitle,
    description: contactDescription,
    url: '/contact',
    images: [{ url: '/api/og?title=Contact+Us', width: 1200, height: 630, alt: contactTitle }],
  },
  twitter: {
    card: 'summary_large_image',
    title: contactTitle,
    description: contactDescription,
    images: ['/api/og?title=Contact+Us'],
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Have a question? Fill in the form and we&rsquo;ll get back to you within 1–2 business
          days. For common answers, check our{' '}
          <Link href="/faq" className="text-primary underline-offset-4 hover:underline">
            FAQ page
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="form-heading">
          <h2 id="form-heading" className="sr-only">
            Contact form
          </h2>
          <ContactForm />
        </section>

        <aside className="space-y-8">
          <div>
            <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-widest uppercase">
              Get in touch
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-medium">Email</span>
                  <br />
                  <a
                    href="mailto:support@tutorplatform.ge"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    support@tutorplatform.ge
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-medium">Phone</span>
                  <br />
                  <a
                    href="tel:+995322000000"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    +995 32 200 00 00
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-medium">Address</span>
                  <br />
                  <span className="text-muted-foreground">
                    8 Ilia Chavchavadze Ave, Tbilisi 0179, Georgia
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-medium">Support hours</span>
                  <br />
                  <span className="text-muted-foreground">Mon – Fri, 9:00 – 18:00 (GET)</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-muted-foreground mb-4 text-sm font-semibold tracking-widest uppercase">
              Follow us
            </h2>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-9 items-center justify-center rounded-lg border transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-9 items-center justify-center rounded-lg border transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-9 items-center justify-center rounded-lg border transition-colors"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
