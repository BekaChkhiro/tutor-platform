import type { TutorProfile } from '@/lib/tutors/fetch-tutor';
import { Clock, Tag } from 'lucide-react';

type Consultation = TutorProfile['consultations'][number];

export function ConsultationsList({ consultations }: { consultations: Consultation[] }) {
  if (!consultations.length) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        კონსულტაციები ჯერ არ არის დამატებული
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {consultations.map((c) => (
        <li
          key={c.id}
          className="border-border rounded-card shadow-rest hover:shadow-hover border bg-white p-5 transition-shadow"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-body font-semibold text-neutral-900">{c.title}</h3>
              <p className="text-body-sm mt-1 line-clamp-2 text-neutral-500">
                {c.descriptionShort}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden />
                  {c.durationMinutes} წუთი
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="size-3.5" aria-hidden />
                  {c.category.name}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 capitalize">
                  {c.bookingType === 'FIXED' ? 'ფიქსირებული' : 'მოქნილი'}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              <p className="text-h4 font-semibold text-neutral-900">
                {Number(c.priceGel).toFixed(0)} ₾
              </p>
              <button
                disabled
                className="bg-primary-500 cursor-not-allowed rounded-lg px-4 py-2 text-sm font-medium text-white opacity-60"
                title="ჯავშანი მალე გახსნება"
              >
                ჯავშანი
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
