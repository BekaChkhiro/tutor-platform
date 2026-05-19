import type { TutorProfile } from '@/lib/tutors/fetch-tutor';
import { Award, ExternalLink } from 'lucide-react';

type Certificate = TutorProfile['certificates'][number];

export function CertificatesList({ certificates }: { certificates: Certificate[] }) {
  if (!certificates.length) return null;

  return (
    <section>
      <h2 className="text-h4 mb-4 flex items-center gap-2 font-semibold text-neutral-900">
        <Award className="text-primary-500 size-5" aria-hidden />
        სერტიფიკატები
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {certificates.map((cert) => (
          <li
            key={cert.id}
            className="border-border rounded-card shadow-rest flex items-start gap-3 border bg-white p-4"
          >
            <div className="bg-primary-50 flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Award className="text-primary-500 size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm leading-snug font-medium text-neutral-900">{cert.title}</p>
              {cert.issuer && <p className="text-caption mt-0.5 text-neutral-400">{cert.issuer}</p>}
              {cert.issuedAt && (
                <p className="text-caption text-neutral-400">{cert.issuedAt.getFullYear()}</p>
              )}
            </div>
            {cert.fileUrl && (
              <a
                href={cert.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600 shrink-0"
                aria-label={`${cert.title} — ფაილის ნახვა`}
              >
                <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
