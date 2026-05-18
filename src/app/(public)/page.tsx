import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/HeroSection';
import { CategoriesGrid } from '@/components/marketing/CategoriesGrid';
import { FeaturedTutors } from '@/components/marketing/FeaturedTutors';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { TrustStrip } from '@/components/marketing/TrustStrip';
import { Testimonials } from '@/components/marketing/Testimonials';
import { FAQTeaser } from '@/components/marketing/FAQTeaser';
import { CTABand } from '@/components/marketing/CTABand';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tutor — გიპოვე ექსპერტი, მიიღე კონსულტაცია',
  description:
    'ონლაინ სწავლის მარტივი გზა. 100+ ვერიფიცირებული ექსპერტი მათემატიკაში, პროგრამირებაში, ენებში და სხვა სფეროებში. დაჯავშნე კონსულტაცია დღეს.',
  openGraph: {
    title: 'Tutor — გიპოვე ექსპერტი, მიიღე კონსულტაცია',
    description: '100+ ვერიფიცირებული ექსპერტი. მარტივი ჯავშანი. TBC / BOG გადახდა.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategoriesGrid />
      <FeaturedTutors />
      <HowItWorks />
      <TrustStrip />
      <Testimonials />
      <FAQTeaser />
      <CTABand />
    </main>
  );
}
