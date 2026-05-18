import { Search, CalendarCheck, Video } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'მოძებნე ექსპერტი',
    description: 'გაფილტრე კატეგორიის, ფასისა და ხელმისაწვდომობის მიხედვით.',
  },
  {
    icon: CalendarCheck,
    title: 'დაჯავშნე კონსულტაცია',
    description: 'აირჩიე მოსახერხებელი დრო და გადაიხადე TBC ან BOG-ით.',
  },
  {
    icon: Video,
    title: 'დაიწყე სწავლა',
    description: 'შეხვდი ექსპერტს ვიდეო სესიაზე — ნებისმიერი მოწყობილობიდან.',
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 id="how-heading" className="mb-10 text-center text-2xl font-semibold tracking-tight">
          როგორ მუშაობს
        </h2>
        <ol className="grid gap-8 md:grid-cols-3" role="list">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex flex-col items-center text-center">
                <div className="bg-muted relative mb-4 flex size-16 items-center justify-center rounded-2xl">
                  <Icon className="size-7" aria-hidden="true" />
                  <span className="bg-foreground text-background absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full text-xs font-bold">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-1 font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
