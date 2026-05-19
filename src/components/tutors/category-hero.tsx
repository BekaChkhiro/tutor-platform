import Link from 'next/link';

interface Category {
  slug: string;
  name: string;
  description: string | null;
}

interface CategoryHeroProps {
  category: Category;
  tutorCount: number;
  relatedCategories: Array<{ slug: string; name: string }>;
}

export function CategoryHero({ category, tutorCount, relatedCategories }: CategoryHeroProps) {
  return (
    <div className="bg-muted/40 border-b py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl text-base">{category.description}</p>
        )}
        <p className="text-muted-foreground mt-2 text-sm">
          {tutorCount > 0 ? `${tutorCount} სპეციალისტი` : 'სპეციალისტები ჯერ არ არის'}
        </p>
        {relatedCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="bg-background hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
