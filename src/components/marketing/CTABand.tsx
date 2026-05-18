import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTABand() {
  return (
    <section className="bg-coral py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-coral-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          გახდი ექსპერტი Tutor-ზე
        </h2>
        <p className="text-coral-foreground/80 mx-auto mt-4 max-w-2xl text-base leading-relaxed">
          გაუზიარე შენი ცოდნა ათასობით მომხმარებელს. დააყენე შენი ფასი, აირჩიე სამუშაო საათები და
          ჩაატარე კონსულტაციები საკუთარი კომფორტიდან.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register?role=tutor"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:bg-neutral-50 hover:shadow-md"
          >
            განაცხადის შევსება
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/faq#become-tutor"
            className="text-coral-foreground/80 hover:text-coral-foreground text-sm font-medium transition-colors"
          >
            გაიგე მეტი →
          </Link>
        </div>
      </div>
    </section>
  );
}
