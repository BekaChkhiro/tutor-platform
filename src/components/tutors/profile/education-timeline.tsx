import type { TutorProfile } from '@/lib/tutors/fetch-tutor';
import { GraduationCap } from 'lucide-react';

type Education = TutorProfile['educations'][number];

export function EducationTimeline({ educations }: { educations: Education[] }) {
  if (!educations.length) return null;

  return (
    <section>
      <h2 className="text-h4 mb-4 flex items-center gap-2 font-semibold text-neutral-900">
        <GraduationCap className="text-primary-500 size-5" aria-hidden />
        განათლება
      </h2>
      <ol className="space-y-4">
        {educations.map((edu) => (
          <li key={edu.id} className="flex gap-4">
            <div className="mt-1 shrink-0">
              <div className="bg-primary-500 ring-primary-50 size-2 rounded-full ring-4" />
            </div>
            <div className="min-w-0">
              <p className="text-body font-medium text-neutral-900">{edu.institution}</p>
              {(edu.degree || edu.fieldOfStudy) && (
                <p className="text-body-sm text-neutral-600">
                  {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}
                </p>
              )}
              {(edu.startYear || edu.endYear) && (
                <p className="text-caption mt-0.5 text-neutral-400">
                  {edu.startYear ?? '?'} – {edu.endYear ?? 'დღემდე'}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
