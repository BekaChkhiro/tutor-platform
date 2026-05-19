import type { TutorProfile } from '@/lib/tutors/fetch-tutor';

export function BookingSidebar({ tutor }: { tutor: TutorProfile }) {
  const activeConsultations = tutor.consultations.filter((c) => !c.archived);
  const minPrice =
    activeConsultations.length > 0
      ? Math.min(...activeConsultations.map((c) => Number(c.priceGel)))
      : null;

  return (
    <div className="border-border rounded-card shadow-rest border bg-white p-6">
      <div className="mb-4">
        {minPrice != null ? (
          <>
            <p className="text-caption text-neutral-400">კონსულტაციის ღირებულება</p>
            <p className="text-h3 font-semibold text-neutral-900">
              {minPrice.toFixed(0)} ₾
              <span className="text-body-sm ml-1 font-normal text-neutral-400">-დან</span>
            </p>
          </>
        ) : (
          <p className="text-body-sm text-neutral-400">კონსულტაციები ჯერ არ არის</p>
        )}
      </div>

      <button
        disabled
        className="bg-primary-500 w-full cursor-not-allowed rounded-lg px-4 py-3 text-sm font-medium text-white opacity-60"
        title="ჯავშანი მალე გახსნება"
        aria-disabled="true"
      >
        კონსულტაციის ჯავშანი
      </button>

      <p className="text-caption mt-3 text-center text-neutral-400">ჯავშანი მალე გახსნება</p>

      {activeConsultations.length > 0 && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="text-caption mb-2 text-neutral-400">ხელმისაწვდომი კონსულტაციები</p>
          <ul className="space-y-1.5">
            {activeConsultations.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs">
                <span className="line-clamp-1 flex-1 pr-2 text-neutral-600">{c.title}</span>
                <span className="shrink-0 font-medium text-neutral-900">
                  {Number(c.priceGel).toFixed(0)} ₾
                </span>
              </li>
            ))}
            {activeConsultations.length > 3 && (
              <li className="text-xs text-neutral-400">+{activeConsultations.length - 3} სხვა</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
