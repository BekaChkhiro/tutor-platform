import type { TutorProfile } from '@/lib/tutors/fetch-tutor';
import { VideoPlayer } from './video-player';
import { EducationTimeline } from './education-timeline';
import { ExperienceTimeline } from './experience-timeline';
import { CertificatesList } from './certificates-list';

export function AboutSection({ tutor }: { tutor: TutorProfile }) {
  const hasAbout = tutor.bio || tutor.skills.length > 0;
  const hasEducation = tutor.educations.length > 0;
  const hasExperience = tutor.experiences.length > 0;
  const hasCertificates = tutor.certificates.length > 0;

  return (
    <div className="space-y-8">
      {tutor.introVideoUrl && <VideoPlayer src={tutor.introVideoUrl} />}

      {hasAbout && (
        <section>
          <h2 className="text-h4 mb-3 font-semibold text-neutral-900">ბიოგრაფია</h2>
          {tutor.bio && (
            <p className="text-body leading-relaxed whitespace-pre-line text-neutral-600">
              {tutor.bio}
            </p>
          )}
          {tutor.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tutor.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-primary-50 text-primary-600 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {hasEducation && <EducationTimeline educations={tutor.educations} />}
      {hasExperience && <ExperienceTimeline experiences={tutor.experiences} />}
      {hasCertificates && <CertificatesList certificates={tutor.certificates} />}

      {!hasAbout && !hasEducation && !hasExperience && !hasCertificates && (
        <p className="py-8 text-center text-sm text-neutral-400">ინფორმაცია მალე დაემატება</p>
      )}
    </div>
  );
}
