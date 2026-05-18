import Link from 'next/link';
import { HeroSearch } from './hero-search';

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="bg-neutral-50 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 md:grid-cols-[60%_40%]">
        <div className="flex flex-col justify-center">
          <h1
            id="hero-heading"
            className="text-foreground max-w-xl text-4xl leading-tight font-bold tracking-tight md:text-6xl"
          >
            გიპოვე ექსპერტი,
            <br className="hidden md:block" /> მოიწვიე კონსულტაცია
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-base leading-relaxed md:text-lg">
            100+ სპეციალისტი სხვადასხვა სფეროში — ვიდეო სესია ნებისმიერ დროს, ნებისმიერი ადგილიდან.
          </p>

          <div className="mt-8 w-full max-w-xl">
            <HeroSearch />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="text-yellow-500">★</span>
              <span>4.8 საშუალო შეფასება</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>100+</span>
              <span>დადასტურებული ექსპერტი</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>🔒</span>
              <span>TBC / BOG გადახდა</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tutors"
              className="inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:ring-2 focus:ring-black/20 focus:outline-none"
              style={{ backgroundColor: 'var(--coral)' }}
            >
              დაიწყე ძებნა →
            </Link>
            <Link
              href="/register/tutor"
              className="border-border inline-flex h-11 items-center justify-center rounded-xl border bg-white px-6 text-sm font-semibold transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-black/20 focus:outline-none"
            >
              გახდი ექსპერტი
            </Link>
          </div>
        </div>

        <div aria-hidden="true" className="hidden items-center justify-center md:flex">
          <div className="relative flex size-80 items-center justify-center rounded-3xl bg-indigo-100">
            <div className="absolute -top-4 -left-4 size-20 rounded-2xl bg-indigo-200 opacity-60" />
            <div className="absolute -right-6 -bottom-6 size-28 rounded-3xl bg-[var(--coral-muted)] opacity-80" />
            <div className="relative flex size-64 items-center justify-center rounded-2xl bg-indigo-50 shadow-lg">
              <div className="grid grid-cols-2 gap-3 p-4">
                {['მ', 'ნ', 'გ', 'ა'].map((letter) => (
                  <div
                    key={letter}
                    className="flex size-24 items-center justify-center rounded-xl bg-indigo-600 text-3xl font-bold text-white"
                  >
                    {letter}
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
