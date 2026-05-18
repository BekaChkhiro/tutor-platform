const testimonials = [
  {
    id: 1,
    name: 'გვანცა ო.',
    role: 'სტუდენტი',
    avatar: 'გ',
    rating: 5,
    text: 'ნინოსთან ერთ სესიაში ისეთი მასალა გავიარე, რაც 2 კვირა ვერ ვიგებდი. ძალიან სასიამოვნო სტილი და მოთმინება. გირჩევ ყველას!',
  },
  {
    id: 2,
    name: 'ბექა ლ.',
    role: 'IT სპეციალისტი',
    avatar: 'ბ',
    rating: 5,
    text: 'ეს პლატფორმა ნამდვილად ამუშავებს. გიორგისგან Python ვისწავლე — ახლა სამსახურში ნამდვილ პროექტებს ვაკეთებ. ღირდა!',
  },
  {
    id: 3,
    name: 'ნინო კ.',
    role: 'სკოლის მოსწავლე',
    avatar: 'ნ',
    rating: 5,
    text: 'სალომე ძალიან კარგად ხსნის IELTS-ის სტრუქტურას. ჩემი ქულა 6.0-დან 7.5-მდე ავიდა სამ თვეში. ვებგვერდი ძალიან მოხერხებულია.',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            რას ამბობენ მომხმარებლები
          </h2>
          <p className="text-muted-foreground mt-3 text-base">რეალური გამოცდილებები</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map(({ id, name, role, avatar, rating, text }) => (
            <figure
              key={id}
              className="border-border flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-1" aria-label={`შეფასება: ${rating}/5`}>
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} className="text-sm text-amber-400" aria-hidden>
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-neutral-700">
                &ldquo;{text}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-muted-foreground text-xs">{role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
