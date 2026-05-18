import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero-section';
import { CategoriesGrid } from '@/components/marketing/categories-grid';
import { FeaturedTutors } from '@/components/marketing/featured-tutors';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { TrustStrip } from '@/components/marketing/trust-strip';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { FaqTeaser } from '@/components/marketing/faq-teaser';
import { CtaBand } from '@/components/marketing/cta-band';

export const metadata: Metadata = {
  title: 'Tutor — გიპოვე ექსპერტი, მოიწვიე კონსულტაცია',
  description:
    '100+ დადასტურებული სპეციალისტი სხვადასხვა სფეროში. დაჯავშნე ვიდეო კონსულტაცია ონლაინ — TBC ან BOG გადახდით.',
  openGraph: {
    title: 'Tutor — გიპოვე ექსპერტი, მოიწვიე კონსულტაცია',
    description:
      '100+ დადასტურებული სპეციალისტი სხვადასხვა სფეროში. დაჯავშნე ვიდეო კონსულტაცია ონლაინ.',
    type: 'website',
    locale: 'ka_GE',
  },
  alternates: {
    canonical: '/',
    languages: {
      'ka-GE': '/',
    },
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
