import Link from 'next/link';
import {
  Calculator,
  Code2,
  Languages,
  Music2,
  Microscope,
  BookOpen,
  Palette,
  TrendingUp,
  HeartPulse,
  Scale,
  Camera,
  Dumbbell,
} from 'lucide-react';

const categories = [
  { slug: 'mathematics', label: 'მათემატიკა', Icon: Calculator, color: 'bg-blue-50 text-blue-600' },
  {
    slug: 'programming',
    label: 'პროგრამირება',
    Icon: Code2,
    color: 'bg-violet-50 text-violet-600',
  },
  { slug: 'languages', label: 'უცხო ენები', Icon: Languages, color: 'bg-green-50 text-green-600' },
  { slug: 'music', label: 'მუსიკა', Icon: Music2, color: 'bg-pink-50 text-pink-600' },
  {
    slug: 'science',
    label: 'საბუნებისმეტყველო',
    Icon: Microscope,
    color: 'bg-teal-50 text-teal-600',
  },
  { slug: 'literature', label: 'ლიტერატურა', Icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
  { slug: 'art', label: 'ხელოვნება', Icon: Palette, color: 'bg-rose-50 text-rose-600' },
  { slug: 'business', label: 'ბიზნესი', Icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
  { slug: 'medicine', label: 'მედიცინა', Icon: HeartPulse, color: 'bg-red-50 text-red-600' },
  { slug: 'law', label: 'სამართალი', Icon: Scale, color: 'bg-slate-50 text-slate-600' },
  { slug: 'photography', label: 'ფოტოგრაფია', Icon: Camera, color: 'bg-orange-50 text-orange-600' },
  { slug: 'fitness', label: 'ფიტნესი', Icon: Dumbbell, color: 'bg-lime-50 text-lime-600' },
];

export function CategoriesGrid() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">კატეგორიები</h2>
          <p className="text-muted-foreground mt-3 text-base">იპოვე ექსპერტი შენი სფეროში</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:gap-4">
          {categories.map(({ slug, label, Icon, color }) => (
            <Link
              key={slug}
              href={`/tutors?category=${slug}`}
              className="group border-border flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-all duration-150 hover:border-neutral-300 hover:shadow-sm"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-105 ${color}`}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <span className="text-xs leading-tight font-medium text-neutral-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
