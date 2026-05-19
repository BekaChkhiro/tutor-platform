import type { TutorProfile } from '@/lib/tutors/fetch-tutor';
import { Briefcase } from 'lucide-react';

type Experience = TutorProfile['experiences'][number];

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  if (!experiences.length) return null;

  return (
    <section>
      <h2 className="text-h4 mb-4 flex items-center gap-2 font-semibold text-neutral-900">
        <Briefcase className="text-primary-500 size-5" aria-hidden />
        გამოცდილება
      </h2>
      <ol className="space-y-4">
        {experiences.map((exp) => (
          <li key={exp.id} className="flex gap-4">
            <div className="mt-1 shrink-0">
              <div className="bg-accent-500 ring-accent-50 size-2 rounded-full ring-4" />
            </div>
            <div className="min-w-0">
              <p className="text-body font-medium text-neutral-900">{exp.role}</p>
              <p className="text-body-sm text-neutral-600">{exp.company}</p>
              {(exp.startYear || exp.endYear) && (
                <p className="text-caption mt-0.5 text-neutral-400">
                  {exp.startYear ?? '?'} – {exp.endYear ?? 'დღემდე'}
                </p>
              )}
              {exp.description && (
                <p className="text-body-sm mt-1 leading-relaxed text-neutral-500">
                  {exp.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
