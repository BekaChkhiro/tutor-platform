import Link from 'next/link';
import { TutorCarousel } from './TutorCarousel';
import type { TutorCardData } from './TutorCard';

export const revalidate = 60;

const FEATURED_SECTIONS: { category: string; slug: string; tutors: TutorCardData[] }[] = [
  {
    category: 'პროგრამირება',
    slug: 'programming',
    tutors: [
      {
        slug: 'giorgi-m',
        name: 'გიორგი მ.',
        headline: 'Python, React, Next.js — 5+ წლიანი გამოცდილება',
        category: 'პროგრამირება',
        rating: 5.0,
        reviewCount: 31,
        startingPrice: 60,
        photoUrl: null,
        verified: true,
      },
      {
        slug: 'ana-k',
        name: 'ანა კ.',
        headline: 'Frontend სპეციალისტი — TypeScript & Vue',
        category: 'პროგრამირება',
        rating: 4.9,
        reviewCount: 18,
        startingPrice: 50,
        photoUrl: null,
        verified: true,
      },
      {
        slug: 'davit-j',
        name: 'დავით ჯ.',
        headline: 'Backend & DevOps — Docker, Kubernetes, Go',
        category: 'პროგრამირება',
        rating: 4.8,
        reviewCount: 22,
        startingPrice: 70,
        photoUrl: null,
        verified: false,
      },
      {
        slug: 'mari-b',
        name: 'მარი ბ.',
        headline: 'Mobile Dev — React Native & Flutter',
        category: 'პროგრამირება',
        rating: 4.7,
        reviewCount: 14,
        startingPrice: 55,
        photoUrl: null,
        verified: true,
      },
    ],
  },
  {
    category: 'მათემატიკა',
    slug: 'mathematics',
    tutors: [
      {
        slug: 'nino-b',
        name: 'ნინო ბ.',
        headline: 'სკოლის მათემატიკა, გამოსაშვები გამოცდა, ეროვნული',
        category: 'მათემატიკა',
        rating: 4.9,
        reviewCount: 47,
        startingPrice: 40,
        photoUrl: null,
        verified: true,
      },
      {
        slug: 'levan-t',
        name: 'ლევან ტ.',
        headline: 'უნივერსიტეტის კალკულუსი და ალგებრა',
        category: 'მათემატიკა',
        rating: 4.8,
        reviewCount: 33,
        startingPrice: 45,
        photoUrl: null,
        verified: true,
      },
      {
        slug: 'keti-g',
        name: 'კეტი გ.',
        headline: 'სახალისო მათემატიკა მოსწავლეებისთვის',
        category: 'მათემატიკა',
        rating: 4.9,
        reviewCount: 29,
        startingPrice: 35,
        photoUrl: null,
        verified: false,
      },
      {
        slug: 'tornike-a',
        name: 'თორნიკე ა.',
        headline: 'სტატისტიკა და ალბათობის თეორია',
        category: 'მათემატიკა',
        rating: 4.7,
        reviewCount: 21,
        startingPrice: 50,
        photoUrl: null,
        verified: true,
      },
    ],
  },
  {
    category: 'ინგლისური',
    slug: 'english',
    tutors: [
      {
        slug: 'salome-a',
        name: 'სალომე ა.',
        headline: 'IELTS / TOEFL მომზადება, C2 დონე',
        category: 'ინგლისური',
        rating: 4.8,
        reviewCount: 52,
        startingPrice: 35,
        photoUrl: null,
        verified: true,
      },
      {
        slug: 'irakli-ch',
        name: 'ირაკლი ჩ.',
        headline: 'ბიზნეს-ინგლისური და კომუნიკაცია',
        category: 'ინგლისური',
        rating: 4.9,
        reviewCount: 38,
        startingPrice: 40,
        photoUrl: null,
        verified: true,
      },
      {
        slug: 'tamar-d',
        name: 'თამარ დ.',
        headline: 'ინგლისური ბავშვებისთვის — A1-B2',
        category: 'ინგლისური',
        rating: 4.8,
        reviewCount: 44,
        startingPrice: 30,
        photoUrl: null,
        verified: false,
      },
      {
        slug: 'nata-v',
        name: 'ნატა ვ.',
        headline: 'ზოგადი ინგლისური, ლაპარაკი, გრამატიკა',
        category: 'ინგლისური',
        rating: 4.7,
        reviewCount: 27,
        startingPrice: 32,
        photoUrl: null,
        verified: true,
      },
    ],
  },
];

export function FeaturedTutors() {
  return (
    <section className="bg-neutral-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">გამორჩეული ექსპერტები</h2>
          <p className="text-muted-foreground mt-3 text-base">
            ვერიფიცირებული სპეციალისტები საუკეთესო შეფასებებით
          </p>
        </div>

        <div className="space-y-12">
          {FEATURED_SECTIONS.map(({ category, slug, tutors }) => (
            <div key={slug}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{category}</h3>
                <Link
                  href={`/tutors?category=${slug}`}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  ყველა →
                </Link>
              </div>
              <TutorCarousel tutors={tutors} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
