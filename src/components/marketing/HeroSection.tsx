import Link from 'next/link';
import { Search, Shield, Users, Star } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-5">
          {/* Text column — 60% */}
          <div className="lg:col-span-3">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              გიპოვე ექსპერტი,
              <br />
              მიიღე კონსულტაცია
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
              დაუკავშირდი სფეროს პროფესიონალებს — ნებისმიერ საკითხში, ნებისმიერ დროს. მარტივი
              ჯავშანი, სერტიფიცირებული ექსპერტები, დაცული გადახდა.
            </p>

            {/* Search bar */}
            <div className="mt-8">
              <div
                className="flex h-14 w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-black/10 lg:w-[70%]"
                role="search"
              >
                <Search className="size-5 shrink-0 text-neutral-400" aria-hidden />
                <input
                  type="search"
                  placeholder="გიპოვე ექსპერტი ან კატეგორია..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  aria-label="ძებნა"
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/tutors"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'bg-coral text-coral-foreground hover:bg-coral/90 h-11 px-6',
                )}
              >
                დაიწყე ძებნა →
              </Link>
              <Link
                href="/register?role=tutor"
                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'h-11 px-6')}
              >
                გახდი ექსპერტი
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                  <Shield className="text-muted-foreground size-4" />
                </div>
                <span className="text-sm font-medium text-neutral-600">TBC / BOG გადახდა</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                  <Users className="text-muted-foreground size-4" />
                </div>
                <span className="text-sm font-medium text-neutral-600">100+ ექსპერტი</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                  <Star className="text-muted-foreground size-4 fill-current" />
                </div>
                <span className="text-sm font-medium text-neutral-600">★ 4.8 საშუალო</span>
              </div>
            </div>
          </div>

          {/* Visual column — 40% */}
          <div className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-center">
            <div className="relative h-80 w-full max-w-sm">
              {/* Abstract geometric composition — Indigo + Coral */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800" />
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {/* Decorative circles */}
                <div className="bg-coral/20 absolute -top-8 -right-8 h-40 w-40 rounded-full" />
                <div className="bg-coral/30 absolute bottom-8 -left-4 h-24 w-24 rounded-full" />
                <div className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
              </div>
              {/* Tutor avatar cards */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                {[
                  { name: 'ნინო ბ.', subject: 'მათემატიკა', rating: '4.9', price: '40 ₾' },
                  { name: 'გიორგი მ.', subject: 'პროგრამირება', rating: '5.0', price: '60 ₾' },
                  { name: 'სალომე ა.', subject: 'ინგლისური', rating: '4.8', price: '35 ₾' },
                ].map((tutor) => (
                  <div
                    key={tutor.name}
                    className="flex w-full items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-lg"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                      {tutor.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900">{tutor.name}</p>
                      <p className="text-xs text-neutral-500">{tutor.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-neutral-900">★ {tutor.rating}</p>
                      <p className="text-xs text-neutral-500">{tutor.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
