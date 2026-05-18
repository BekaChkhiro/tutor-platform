import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Clock, BookOpen, GraduationCap, Briefcase, Award, ChevronLeft } from 'lucide-react';
import { fetchTutorBySlug } from '@/server/actions/tutors/fetch-tutor';
import type { TutorProfile, ReviewItem } from '@/server/actions/tutors/fetch-tutor';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutor = await fetchTutorBySlug(slug);
  if (!tutor) return { title: 'ექსპერტი ვერ მოიძებნა' };

  const name = [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'ექსპერტი';

  return {
    title: `${name} — Tutor`,
    description: tutor.headline ?? `${name}-ის პროფილი Tutor-ზე.`,
  };
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const tutor = await fetchTutorBySlug(slug);
  if (!tutor) notFound();

  const name = [tutor.user.firstName, tutor.user.lastName].filter(Boolean).join(' ') || 'ექსპერტი';

  return (
    <main className="bg-background min-h-screen">
      {/* Back nav */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/tutors"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            ყველა ექსპერტი
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-10 xl:grid-cols-[320px_1fr]">
          {/* ─── Sidebar ─── */}
          <aside className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-8 lg:space-y-5">
              <ProfileCard tutor={tutor} name={name} />
              <ConsultationsAside consultations={tutor.consultations} tutorSlug={tutor.slug} />
            </div>
          </aside>

          {/* ─── Main content ─── */}
          <div className="space-y-8">
            {tutor.bio && <AboutSection bio={tutor.bio} />}
            {tutor.skills.length > 0 && <SkillsSection skills={tutor.skills} />}
            {tutor.consultations.length > 0 && (
              <ConsultationsMobile consultations={tutor.consultations} tutorSlug={tutor.slug} />
            )}
            {tutor.experiences.length > 0 && <ExperienceSection experiences={tutor.experiences} />}
            {tutor.educations.length > 0 && <EducationSection educations={tutor.educations} />}
            {tutor.certificates.length > 0 && (
              <CertificatesSection certificates={tutor.certificates} />
            )}
            {tutor.reviewCount > 0 && (
              <ReviewsSection
                reviews={tutor.reviews}
                avgRating={tutor.avgRating}
                reviewCount={tutor.reviewCount}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── ProfileCard ─────────────────────────────────────────────────── */

function ProfileCard({ tutor, name }: { tutor: TutorProfile; name: string }) {
  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      {/* Photo */}
      <div className="bg-muted relative mx-auto mb-4 h-36 w-36 overflow-hidden rounded-full">
        {tutor.photoUrl ? (
          <Image
            src={tutor.photoUrl}
            alt={name}
            fill
            sizes="144px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="bg-primary/10 flex h-full w-full items-center justify-center">
            <span className="text-primary/60 text-4xl font-semibold">
              {(tutor.user.firstName?.[0] ?? '?').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Name + verified */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-foreground text-xl font-semibold">{name}</h1>
          <span
            className="bg-primary flex h-5 w-5 items-center justify-center rounded-full"
            title="დამოწმებული"
          >
            <svg
              className="text-primary-foreground h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>

        {tutor.headline && <p className="text-muted-foreground mt-1 text-sm">{tutor.headline}</p>}

        {/* Categories */}
        {tutor.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {tutor.categories.map(({ category }) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Rating */}
        {tutor.avgRating !== null && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-foreground font-semibold">{tutor.avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">· {tutor.reviewCount} შეფასება</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/tutors/${tutor.slug}/book`}
        className={cn(
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'mt-5 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors',
        )}
      >
        კონსულტაციის ჯავშანი
      </Link>
    </div>
  );
}

/* ─── ConsultationsAside (desktop) ───────────────────────────────── */

function ConsultationsAside({
  consultations,
  tutorSlug,
}: {
  consultations: TutorProfile['consultations'];
  tutorSlug: string;
}) {
  if (consultations.length === 0) return null;

  const minPrice = Math.min(...consultations.map((c) => Number(c.priceGel)));

  return (
    <div className="bg-card border-border hidden rounded-xl border p-4 shadow-sm lg:block">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        კონსულტაციები
      </p>
      <p className="text-foreground mt-1 text-lg font-semibold">{minPrice}₾-დან</p>
      <ul className="mt-3 space-y-2">
        {consultations.slice(0, 4).map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-foreground min-w-0 truncate">{c.title}</span>
            <span className="text-muted-foreground shrink-0">{c.priceGel}₾</span>
          </li>
        ))}
        {consultations.length > 4 && (
          <li className="text-muted-foreground text-xs">
            +{consultations.length - 4} სხვა კონსულტაცია
          </li>
        )}
      </ul>
      <Link
        href={`/tutors/${tutorSlug}/book`}
        className={cn(
          'border-border text-foreground hover:bg-muted',
          'mt-4 block w-full rounded-lg border px-3 py-2 text-center text-sm transition-colors',
        )}
      >
        კონსულტაციის არჩევა
      </Link>
    </div>
  );
}

/* ─── Section wrapper ─────────────────────────────────────────────── */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <h2 className="text-foreground mb-4 flex items-center gap-2 text-base font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ─── AboutSection ────────────────────────────────────────────────── */

function AboutSection({ bio }: { bio: string }) {
  return (
    <Section title="ჩემ შესახებ">
      <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">{bio}</p>
    </Section>
  );
}

/* ─── SkillsSection ───────────────────────────────────────────────── */

function SkillsSection({ skills }: { skills: TutorProfile['skills'] }) {
  return (
    <Section title="უნარები" icon={<BookOpen className="text-muted-foreground h-4 w-4" />}>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s.id}
            className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium"
          >
            {s.name}
          </span>
        ))}
      </div>
    </Section>
  );
}

/* ─── ConsultationsMobile (shows on all screens, hidden at lg via CSS) */

function ConsultationsMobile({
  consultations,
  tutorSlug,
}: {
  consultations: TutorProfile['consultations'];
  tutorSlug: string;
}) {
  return (
    <Section title="კონსულტაციები" icon={<Clock className="text-muted-foreground h-4 w-4" />}>
      <div className="space-y-3">
        {consultations.map((c) => (
          <div
            key={c.id}
            className="border-border rounded-lg border p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-medium">{c.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{c.category.name}</p>
                <p className="text-muted-foreground mt-1.5 text-sm">{c.descriptionShort}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-foreground font-semibold">{c.priceGel}₾</p>
                <p className="text-muted-foreground text-xs">{c.durationMinutes} წთ</p>
              </div>
            </div>
            <Link
              href={`/tutors/${tutorSlug}/book?consultation=${c.id}`}
              className={cn(
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'mt-3 inline-block rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              )}
            >
              დაჯავშნა
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── ExperienceSection ───────────────────────────────────────────── */

function ExperienceSection({ experiences }: { experiences: TutorProfile['experiences'] }) {
  return (
    <Section title="გამოცდილება" icon={<Briefcase className="text-muted-foreground h-4 w-4" />}>
      <div className="space-y-4">
        {experiences.map((e) => (
          <div key={e.id} className="flex gap-3">
            <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <Briefcase className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm font-medium">{e.role}</p>
              <p className="text-muted-foreground text-xs">{e.company}</p>
              {(e.startYear || e.endYear) && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {e.startYear ?? '?'} — {e.endYear ?? 'დღემდე'}
                </p>
              )}
              {e.description && (
                <p className="text-foreground/70 mt-1.5 text-sm">{e.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── EducationSection ────────────────────────────────────────────── */

function EducationSection({ educations }: { educations: TutorProfile['educations'] }) {
  return (
    <Section title="განათლება" icon={<GraduationCap className="text-muted-foreground h-4 w-4" />}>
      <div className="space-y-4">
        {educations.map((e) => (
          <div key={e.id} className="flex gap-3">
            <div className="bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <GraduationCap className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm font-medium">{e.institution}</p>
              {e.degree && (
                <p className="text-muted-foreground text-xs">
                  {e.degree}
                  {e.fieldOfStudy ? ` · ${e.fieldOfStudy}` : ''}
                </p>
              )}
              {(e.startYear || e.endYear) && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {e.startYear ?? '?'} — {e.endYear ?? 'დღემდე'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── CertificatesSection ─────────────────────────────────────────── */

function CertificatesSection({ certificates }: { certificates: TutorProfile['certificates'] }) {
  return (
    <Section title="სერტიფიკატები" icon={<Award className="text-muted-foreground h-4 w-4" />}>
      <ul className="space-y-2">
        {certificates.map((c) => (
          <li key={c.id} className="flex items-start gap-2">
            <Award className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-foreground text-sm font-medium">{c.title}</p>
              {(c.issuer || c.issuedAt) && (
                <p className="text-muted-foreground text-xs">
                  {c.issuer}
                  {c.issuer && c.issuedAt ? ' · ' : ''}
                  {c.issuedAt
                    ? new Date(c.issuedAt).toLocaleDateString('ka-GE', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : ''}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ─── ReviewsSection ──────────────────────────────────────────────── */

function ReviewsSection({
  reviews,
  avgRating,
  reviewCount,
}: {
  reviews: ReviewItem[];
  avgRating: number | null;
  reviewCount: number;
}) {
  return (
    <Section
      title={`შეფასებები (${reviewCount})`}
      icon={<Star className="text-muted-foreground h-4 w-4" />}
    >
      {/* Summary */}
      {avgRating !== null && (
        <div className="mb-5 flex items-center gap-3">
          <span className="text-foreground text-4xl font-bold">{avgRating.toFixed(1)}</span>
          <div>
            <StarRow rating={avgRating} />
            <p className="text-muted-foreground mt-0.5 text-xs">{reviewCount} შეფასება</p>
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="divide-border divide-y">
        {reviews.map((r) => {
          const reviewer =
            [r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || 'მომხმარებელი';
          return (
            <div key={r.id} className="py-4 first:pt-0 last:pb-0">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-foreground text-sm font-medium">{reviewer}</span>
                <time className="text-muted-foreground shrink-0 text-xs">
                  {new Date(r.createdAt).toLocaleDateString('ka-GE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <StarRow rating={r.rating} size="sm" />
              {r.comment && (
                <p className="text-foreground/80 mt-2 text-sm leading-relaxed">{r.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ─── StarRow ─────────────────────────────────────────────────────── */

function StarRow({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            cls,
            n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  );
}
