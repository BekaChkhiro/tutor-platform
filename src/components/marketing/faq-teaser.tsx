import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'როგორ ავირჩიო სწორი ექსპერტი?',
    a: 'გაიარე ფილტრები კატეგორიის, ფასისა და შეფასებების მიხედვით. თითოეულ ექსპერტს აქვს დეტალური პროფილი.',
  },
  {
    q: 'როგორ მუშაობს გადახდა?',
    a: 'ვიღებთ TBC და BOG ბარათებს. გადახდა კონსულტაციის ჯავშნისას ხდება — სრულად დაცულია.',
  },
  {
    q: 'შემიძლია სესიის გაუქმება?',
    a: 'კი, სესიის გაუქმება შეიძლება სტარტამდე 24 საათით ადრე სრული თანხის დაბრუნებით.',
  },
  {
    q: 'რა მოწყობილობა მჭირდება?',
    a: 'ნებისმიერი კომპიუტერი ან სმარტფონი ბრაუზერით — სპეციალური პროგრამა არ გჭირდება.',
  },
];

export function FaqTeaser() {
  return (
    <section aria-labelledby="faq-teaser-heading" className="bg-background py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 id="faq-teaser-heading" className="text-2xl font-semibold tracking-tight">
            ხშირად დასმული კითხვები
          </h2>
          <Link
            href="/faq"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ყველა კითხვა →
          </Link>
        </div>
        <ul className="divide-border divide-y" role="list">
          {FAQ_ITEMS.map((item) => (
            <li key={item.q} className="py-4">
              <details className="group">
                <summary className="text-foreground flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
                  {item.q}
                  <ChevronRight
                    className="text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  />
                </summary>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
