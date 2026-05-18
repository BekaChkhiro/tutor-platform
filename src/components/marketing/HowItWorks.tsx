import { Search, CalendarCheck, Video } from 'lucide-react';

const steps = [
  {
    step: 1,
    Icon: Search,
    title: 'იპოვე ექსპერტი',
    description:
      'გამოიყენე ძებნა ან დაათვალიერე კატეგორიები. გაეცანი პროფილს, შეფასებებს და ფასებს.',
  },
  {
    step: 2,
    Icon: CalendarCheck,
    title: 'დაჯავშნე დრო',
    description:
      'აირჩიე შენთვის მოსახერხებელი თარიღი და დრო. გადაიხადე TBC ან BOG ბარათით — სწრაფად და უსაფრთხოდ.',
  },
  {
    step: 3,
    Icon: Video,
    title: 'ჩაატარე კონსულტაცია',
    description:
      'შეხვდი ექსპერტს ვიდეოზარით პლატფორმის შიგნით. ჩაწერე, გაგზავნე ფაილები, გამოიყენე ჩეთი.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">როგორ მუშაობს</h2>
          <p className="text-muted-foreground mt-3 text-base">
            სამი ნაბიჯი — დაწყებიდან კონსულტაციამდე
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ step, Icon, title, description }, idx) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="bg-border absolute top-7 left-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] md:block" />
              )}
              <div className="relative mb-5 flex size-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Icon className="size-6 text-indigo-600" aria-hidden />
                <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  {step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
