import Link from 'next/link';

export function EmptyFilterState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-muted-foreground text-lg font-medium">ექსპერტი ვერ მოიძებნა</p>
      <p className="text-muted-foreground mt-1 text-sm">სცადეთ ფილტრების გასუფთავება</p>
      <Link
        href="/tutors"
        className="bg-foreground text-background mt-6 rounded-lg px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80"
      >
        ფილტრების გასუფთავება
      </Link>
    </div>
  );
}
