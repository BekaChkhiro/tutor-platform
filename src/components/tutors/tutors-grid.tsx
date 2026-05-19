import { TutorCard } from './tutor-card';
import type { TutorListItem } from '@/lib/tutors/fetch-tutors';

export function TutorsGrid({ tutors }: { tutors: TutorListItem[] }) {
  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      role="list"
      aria-label="ექსპერტების სია"
    >
      {tutors.map((tutor) => (
        <li key={tutor.id}>
          <TutorCard tutor={tutor} />
        </li>
      ))}
    </ul>
  );
}
