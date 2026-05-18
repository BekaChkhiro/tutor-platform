import { Shield, Users, Star } from 'lucide-react';

const STATS = [
  { icon: Users, label: '100+ ექსპერტი', sub: 'დადასტურებული სპეციალისტი' },
  { icon: Star, label: '★ 4.8 საშუალო', sub: 'მომხმარებელთა შეფასება' },
  { icon: Shield, label: 'გადახდა დაცულია', sub: 'TBC ან BOG ბარათით' },
];

export function TrustStrip() {
  return (
    <section aria-label="ნდობის სტატისტიკა" className="border-border bg-background border-y py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3" role="list">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <li key={stat.label} className="flex items-center gap-4">
                <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold">{stat.label}</p>
                  <p className="text-muted-foreground text-xs">{stat.sub}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
