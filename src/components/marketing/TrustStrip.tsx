import { Shield, Users, Star, Clock } from 'lucide-react';

const stats = [
  { Icon: Users, value: '100+', label: 'ვერიფიცირებული ექსპერტი' },
  { Icon: Star, value: '4.8', label: 'საშუალო შეფასება' },
  { Icon: Clock, value: '1 000+', label: 'ჩატარებული კონსულტაცია' },
  { Icon: Shield, value: '100%', label: 'დაცული გადახდა' },
];

export function TrustStrip() {
  return (
    <section className="border-border border-y bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Payment partner logos */}
        <p className="text-muted-foreground mb-8 text-center text-xs font-medium tracking-wider uppercase">
          გადახდის პარტნიორები
        </p>
        <div className="mb-10 flex items-center justify-center gap-8 sm:gap-12">
          {/* TBC placeholder */}
          <div className="flex h-8 items-center rounded-md bg-[#00A651] px-4">
            <span className="text-sm font-bold tracking-wider text-white">TBC</span>
          </div>
          {/* BOG placeholder */}
          <div className="flex h-8 items-center rounded-md bg-[#F7931E] px-4">
            <span className="text-sm font-bold tracking-wider text-white">BOG</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon className="text-muted-foreground size-5" aria-hidden />
              <span className="text-2xl font-bold tabular-nums">{value}</span>
              <span className="text-muted-foreground text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
