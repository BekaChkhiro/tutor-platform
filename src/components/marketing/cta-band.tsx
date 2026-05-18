import Link from 'next/link';

export function CtaBand() {
  return (
    <section
      aria-labelledby="cta-band-heading"
      className="py-16"
      style={{ backgroundColor: 'var(--coral)' }}
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 id="cta-band-heading" className="text-2xl font-semibold text-white sm:text-3xl">
          გახდი ექსპერტი ჩვენს პლატფორმაზე
        </h2>
        <p className="mt-3 text-sm text-white/80">
          გაიზიარე ცოდნა, მოახდინე გავლენა და ისარგებლე მოქნილი განრიგით.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register/tutor"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[var(--coral)] transition-opacity hover:opacity-90 focus:ring-2 focus:ring-white/50 focus:outline-none"
          >
            განაცხადი შეავსე →
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium text-white/80 underline underline-offset-4 transition-colors hover:text-white"
          >
            გაიგე მეტი
          </Link>
        </div>
      </div>
    </section>
  );
}
