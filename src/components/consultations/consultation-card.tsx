import Link from 'next/link';
import Image from 'next/image';
import { Clock, Tag } from 'lucide-react';
import type { ConsultationListItem } from '@/lib/consultations/fetch-consultations';

export function ConsultationCard({ consultation }: { consultation: ConsultationListItem }) {
  const tutorName =
    [consultation.tutor.user.firstName, consultation.tutor.user.lastName]
      .filter(Boolean)
      .join(' ') || 'Tutor';

  return (
    <Link
      href={`/tutors/${consultation.tutor.slug}`}
      className="group border-border bg-background flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      aria-label={`${consultation.title} — ${tutorName}`}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-full">
            {consultation.tutor.photoUrl ? (
              <Image
                src={consultation.tutor.photoUrl}
                alt={tutorName}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground text-sm font-semibold">
                  {tutorName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">{tutorName}</p>
            {consultation.tutor.headline && (
              <p className="text-muted-foreground truncate text-xs">
                {consultation.tutor.headline}
              </p>
            )}
          </div>
        </div>

        <h3 className="text-foreground mb-1 line-clamp-2 leading-snug font-semibold">
          {consultation.title}
        </h3>
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
          {consultation.descriptionShort}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
          <span className="border-border inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium">
            <Tag className="size-3" aria-hidden="true" />
            {consultation.category.name}
          </span>
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden="true" />
            {consultation.durationMinutes} წუთი
          </span>
        </div>
      </div>

      <div className="border-border flex items-center justify-between border-t px-5 py-3">
        <span className="text-foreground font-semibold">
          {Number(consultation.priceGel).toFixed(0)} ₾
        </span>
        <span className="text-primary group-hover:text-primary text-sm font-medium transition-opacity group-hover:opacity-80">
          დეტალები →
        </span>
      </div>
    </Link>
  );
}
