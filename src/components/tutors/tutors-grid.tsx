import { TutorCard } from './tutor-card';
import type { TutorListItem } from '@/server/actions/tutors/fetch-tutors';

interface TutorsGridProps {
  tutors: TutorListItem[];
}

export function TutorsGrid({ tutors }: TutorsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tutors.map((tutor) => (
        <TutorCard key={tutor.id} tutor={tutor} />
      ))}
    </div>
  );
}
