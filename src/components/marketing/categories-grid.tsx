import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import {
  BookOpen,
  Calculator,
  Code2,
  FlaskConical,
  Globe,
  Music,
  Palette,
  Languages,
  Dumbbell,
  BriefcaseBusiness,
  Camera,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  math: Calculator,
  programming: Code2,
  science: FlaskConical,
  language: Languages,
  english: Globe,
  music: Music,
  art: Palette,
  fitness: Dumbbell,
  business: BriefcaseBusiness,
  photography: Camera,
  health: HeartPulse,
};

function CategoryIcon({ iconName }: { iconName: string | null }) {
  const key = iconName?.toLowerCase() ?? '';
  const Icon: LucideIcon = ICON_MAP[key] ?? BookOpen;
  return <Icon className="size-6" aria-hidden="true" />;
}

export async function CategoriesGrid() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    take: 12,
    include: { _count: { select: { tutors: true } } },
  });

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-heading" className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 id="categories-heading" className="mb-8 text-2xl font-semibold tracking-tight">
          კატეგორიები
        </h2>
        <ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          role="list"
        >
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/tutors?category=${cat.slug}`}
                className="border-border hover:border-foreground/20 hover:bg-muted flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors"
              >
                <span className="bg-muted flex size-12 items-center justify-center rounded-lg">
                  <CategoryIcon iconName={cat.iconName} />
                </span>
                <span className="text-foreground text-sm leading-tight font-medium">
                  {cat.name}
                </span>
                <span className="text-muted-foreground text-xs">{cat._count.tutors} ექსპერტი</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
