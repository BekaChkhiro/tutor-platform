import { ConsultationCard } from './consultation-card';
import type { ConsultationListItem } from '@/lib/consultations/fetch-consultations';

export function ConsultationsGrid({ consultations }: { consultations: ConsultationListItem[] }) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="კონსულტაციების სია"
    >
      {consultations.map((c) => (
        <li key={c.id}>
          <ConsultationCard consultation={c} />
        </li>
      ))}
    </ul>
  );
}
