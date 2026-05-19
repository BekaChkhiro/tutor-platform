import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero-section';
import { CategoriesGrid } from '@/components/marketing/categories-grid';
import { FeaturedTutors } from '@/components/marketing/featured-tutors';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { TrustStrip } from '@/components/marketing/trust-strip';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { FaqTeaser } from '@/components/marketing/faq-teaser';
import { CtaBand } from '@/components/marketing/cta-band';

const TITLE = 'Tutor — გიპოვე ექსპერტი, მოიწვიე კონსულტაცია';
const DESCRIPTION =
  '100+ დადასტურებული სპეციალისტი სხვადასხვა სფეროში. დაჯავშნე ვიდეო კონსულტაცია ონლაინ — TBC ან BOG გადახდით.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
    languages: { 'ka-GE': '/' },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'ka_GE',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/api/og'],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <CategoriesGrid />
      <FeaturedTutors />
      <HowItWorks />
      <TestimonialsSection />
      <FaqTeaser />
      <CtaBand />
    </>
  );
}
