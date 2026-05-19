'use client';

import { useId, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/auth/photo-upload';
import {
  step1Schema,
  step4Schema,
  step5Schema,
  type Step1Input,
  type Step4Input,
  type Step5Input,
} from '@/lib/validators/onboarding';
import {
  saveStep1,
  saveStep3,
  saveStep4,
  saveStep5,
  submitForReview,
} from '@/server/actions/tutors/onboarding';

export interface Category {
  id: string;
  name: string;
}

export interface OnboardingData {
  onboardingStep: number;
  onboardingComplete: boolean;
  status: string;
  headline: string | null;
  bio: string | null;
  photoUrl: string | null;
  skills: { name: string }[];
  categories: { categoryId: string }[];
  educations: {
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startYear: number | null;
    endYear: number | null;
  }[];
  experiences: {
    company: string;
    role: string;
    startYear: number | null;
    endYear: number | null;
    description: string | null;
  }[];
  certificates: {
    title: string;
    issuer: string | null;
    issuedAt: Date | null;
  }[];
}

interface WizardProps {
  initialData: OnboardingData;
  categories: Category[];
}

const STEP_LABELS = [
  'Basic info',
  'Photo & video',
  'Skills',
  'Background',
  'Certificates',
  'Review',
];

function toDateInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function inputCls(hasError?: boolean) {
  return cn(
    'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
    'placeholder:text-muted-foreground',
    'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
    hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
  );
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: ((id: string) => React.ReactNode) | React.ReactNode;
  hint?: string;
}) {
  const autoId = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={autoId} className="text-sm font-medium">
        {label}
      </label>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      {typeof children === 'function' ? children(autoId) : children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col items-center gap-1',
              i + 1 < currentStep && 'opacity-60',
              i + 1 === currentStep && 'font-semibold',
            )}
          >
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                i + 1 < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i + 1 === currentStep
                    ? 'bg-primary text-primary-foreground ring-primary/30 ring-4'
                    : 'border-border bg-background border text-zinc-400',
              )}
            >
              {i + 1 < currentStep ? '✓' : i + 1}
            </div>
            <span className="hidden text-xs sm:block">{label}</span>
          </div>
        ))}
      </div>
      <div className="bg-border h-1 rounded-full">
        <div
          className="bg-primary h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Basic info ────────────────────────────────────────────────────

function Step1({
  initial,
  onNext,
}: {
  initial: OnboardingData;
  onNext: (patch: Partial<OnboardingData>) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step1Input>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step1Schema as any),
    defaultValues: {
      headline: initial.headline ?? '',
      bio: initial.bio ?? '',
    },
  });

  async function onSubmit(data: Step1Input) {
    setServerError(null);
    const result = await saveStep1(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onNext({ headline: data.headline, bio: data.bio });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-xl font-semibold">Basic information</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Your headline and bio are the first things students see.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <Field
        label="Headline"
        error={errors.headline?.message}
        hint="A short sentence describing what you teach (10–120 characters)"
      >
        {(id) => (
          <input
            id={id}
            {...register('headline')}
            className={inputCls(!!errors.headline)}
            placeholder="Experienced Math & Physics tutor with 8 years of practice"
          />
        )}
      </Field>

      <Field
        label="Bio"
        error={errors.bio?.message}
        hint="Tell students about your teaching style, experience and approach (50–2000 characters)"
      >
        {(id) => (
          <textarea
            id={id}
            {...register('bio')}
            rows={6}
            className={inputCls(!!errors.bio)}
            placeholder="I have been teaching mathematics and physics for..."
          />
        )}
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save & continue'}
        </Button>
      </div>
    </form>
  );
}

// ─── Step 2: Photo upload ──────────────────────────────────────────────────

function Step2({
  initial,
  onNext,
  onBack,
}: {
  initial: OnboardingData;
  onNext: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial.photoUrl);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Profile photo</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload a professional photo. Students are more likely to book tutors with a clear photo.
        </p>
      </div>

      <PhotoUpload currentPhotoUrl={photoUrl} onUploaded={(url) => setPhotoUrl(url)} />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={() => onNext({ photoUrl })}>
          {photoUrl ? 'Save & continue' : 'Skip for now'}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Skills & categories ──────────────────────────────────────────

function Step3({
  initial,
  categories,
  onNext,
  onBack,
}: {
  initial: OnboardingData;
  categories: Category[];
  onNext: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState(initial.skills.map((s) => s.name).join(', '));
  const [selectedCats, setSelectedCats] = useState<string[]>(
    initial.categories.map((c) => c.categoryId),
  );
  const [catError, setCatError] = useState<string | null>(null);
  const [skillError, setSkillError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCatError(null);
    setSkillError(null);
    setServerError(null);

    const skills = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      setSkillError('Add at least one skill');
      return;
    }
    if (selectedCats.length === 0) {
      setCatError('Select at least one category');
      return;
    }

    setSubmitting(true);
    let result: Awaited<ReturnType<typeof saveStep3>>;
    try {
      result = await saveStep3({ skills, categoryIds: selectedCats });
    } finally {
      setSubmitting(false);
    }

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onNext({
      skills: skills.map((name) => ({ name })),
      categories: selectedCats.map((categoryId) => ({ categoryId })),
    });
  }

  function toggleCat(id: string) {
    setSelectedCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <h2 className="text-xl font-semibold">Skills & categories</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Help students find you by specifying what you teach.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <Field
        label="Skills"
        error={skillError ?? undefined}
        hint="Separate skills with commas, e.g. Mathematics, Physics, Python"
      >
        {(id) => (
          <input
            id={id}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            className={inputCls(!!skillError)}
            placeholder="Mathematics, Physics, Python"
          />
        )}
      </Field>

      <Field label="Categories" error={catError ?? undefined} hint="Select up to 5 categories">
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCat(cat.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                selectedCats.includes(cat.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted',
              )}
            >
              {cat.name}
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-muted-foreground text-sm">No categories available yet.</p>
          )}
        </div>
      </Field>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save & continue'}
        </Button>
      </div>
    </form>
  );
}

// ─── Step 4: Education & experience ───────────────────────────────────────

function Step4({
  initial,
  onNext,
  onBack,
}: {
  initial: OnboardingData;
  onNext: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Step4Input>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step4Schema as any),
    defaultValues: {
      educations:
        initial.educations.length > 0
          ? initial.educations.map((e) => ({
              institution: e.institution,
              degree: e.degree ?? undefined,
              fieldOfStudy: e.fieldOfStudy ?? undefined,
              startYear: e.startYear ?? undefined,
              endYear: e.endYear ?? undefined,
            }))
          : [],
      experiences:
        initial.experiences.length > 0
          ? initial.experiences.map((e) => ({
              company: e.company,
              role: e.role,
              startYear: e.startYear ?? undefined,
              endYear: e.endYear ?? undefined,
              description: e.description ?? undefined,
            }))
          : [],
    },
  });

  const {
    fields: eduFields,
    append: addEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: 'educations',
  });
  const {
    fields: expFields,
    append: addExp,
    remove: removeExp,
  } = useFieldArray({
    control,
    name: 'experiences',
  });

  async function onSubmit(data: Step4Input) {
    setServerError(null);
    const result = await saveStep4(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onNext({
      educations: data.educations.map((e) => ({
        institution: e.institution,
        degree: e.degree ?? null,
        fieldOfStudy: e.fieldOfStudy ?? null,
        startYear: e.startYear ?? null,
        endYear: e.endYear ?? null,
      })),
      experiences: data.experiences.map((e) => ({
        company: e.company,
        role: e.role,
        startYear: e.startYear ?? null,
        endYear: e.endYear ?? null,
        description: e.description ?? null,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <h2 className="text-xl font-semibold">Education & experience</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Share your academic background and work history.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">Education</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addEdu({
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startYear: null,
                endYear: null,
              })
            }
          >
            + Add
          </Button>
        </div>
        {eduFields.map((field, i) => (
          <div key={field.id} className="border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Institution"
                  error={
                    (errors.educations?.[i]?.institution as { message?: string } | undefined)
                      ?.message
                  }
                >
                  <input
                    {...register(`educations.${i}.institution`)}
                    className={inputCls(!!errors.educations?.[i]?.institution)}
                    placeholder="University of Georgia"
                  />
                </Field>
                <Field label="Degree">
                  <input
                    {...register(`educations.${i}.degree`)}
                    className={inputCls()}
                    placeholder="Bachelor's"
                  />
                </Field>
                <Field label="Field of study">
                  <input
                    {...register(`educations.${i}.fieldOfStudy`)}
                    className={inputCls()}
                    placeholder="Computer Science"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start year">
                    <input
                      {...register(`educations.${i}.startYear`, { valueAsNumber: true })}
                      type="number"
                      className={inputCls()}
                      placeholder="2016"
                    />
                  </Field>
                  <Field label="End year">
                    <input
                      {...register(`educations.${i}.endYear`, { valueAsNumber: true })}
                      type="number"
                      className={inputCls()}
                      placeholder="2020"
                    />
                  </Field>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeEdu(i)}
                className="text-muted-foreground hover:text-destructive mt-1 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            Experience
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              addExp({ company: '', role: '', startYear: null, endYear: null, description: '' })
            }
          >
            + Add
          </Button>
        </div>
        {expFields.map((field, i) => (
          <div key={field.id} className="border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Company"
                  error={
                    (errors.experiences?.[i]?.company as { message?: string } | undefined)?.message
                  }
                >
                  <input
                    {...register(`experiences.${i}.company`)}
                    className={inputCls(!!errors.experiences?.[i]?.company)}
                    placeholder="Acme Corp"
                  />
                </Field>
                <Field
                  label="Role"
                  error={
                    (errors.experiences?.[i]?.role as { message?: string } | undefined)?.message
                  }
                >
                  <input
                    {...register(`experiences.${i}.role`)}
                    className={inputCls(!!errors.experiences?.[i]?.role)}
                    placeholder="Senior Tutor"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start year">
                    <input
                      {...register(`experiences.${i}.startYear`, { valueAsNumber: true })}
                      type="number"
                      className={inputCls()}
                      placeholder="2018"
                    />
                  </Field>
                  <Field label="End year">
                    <input
                      {...register(`experiences.${i}.endYear`, { valueAsNumber: true })}
                      type="number"
                      className={inputCls()}
                      placeholder="2022"
                    />
                  </Field>
                </div>
                <Field label="Description" hint="Optional">
                  <textarea
                    {...register(`experiences.${i}.description`)}
                    rows={2}
                    className={inputCls()}
                    placeholder="Brief description of your role"
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => removeExp(i)}
                className="text-muted-foreground hover:text-destructive mt-1 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save & continue'}
        </Button>
      </div>
    </form>
  );
}

// ─── Step 5: Certificates ─────────────────────────────────────────────────

function Step5({
  initial,
  onNext,
  onBack,
}: {
  initial: OnboardingData;
  onNext: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Step5Input>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(step5Schema as any),
    defaultValues: {
      certificates:
        initial.certificates.length > 0
          ? initial.certificates.map((c) => ({
              title: c.title,
              issuer: c.issuer ?? '',
              issuedAt: c.issuedAt ? toDateInputValue(new Date(c.issuedAt)) : '',
            }))
          : [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'certificates' });

  async function onSubmit(data: Step5Input) {
    setServerError(null);
    const result = await saveStep5(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onNext({
      certificates: data.certificates.map((c) => ({
        title: c.title,
        issuer: c.issuer ?? null,
        issuedAt: c.issuedAt ? new Date(c.issuedAt) : null,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-xl font-semibold">Certificates</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Add any relevant certificates or qualifications.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, i) => (
          <div key={field.id} className="border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Certificate title"
                  error={
                    (errors.certificates?.[i]?.title as { message?: string } | undefined)?.message
                  }
                >
                  <input
                    {...register(`certificates.${i}.title`)}
                    className={inputCls(!!errors.certificates?.[i]?.title)}
                    placeholder="IELTS Certificate"
                  />
                </Field>
                <Field label="Issuing organisation">
                  <input
                    {...register(`certificates.${i}.issuer`)}
                    className={inputCls()}
                    placeholder="British Council"
                  />
                </Field>
                <Field label="Issue date">
                  <input
                    {...register(`certificates.${i}.issuedAt`)}
                    type="date"
                    className={inputCls()}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive mt-1 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: '', issuer: '', issuedAt: null })}
        >
          + Add certificate
        </Button>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save & continue'}
        </Button>
      </div>
    </form>
  );
}

// ─── Step 6: Review & submit ───────────────────────────────────────────────

function Step6({
  initial,
  categories,
  onBack,
  onSubmitted,
}: {
  initial: OnboardingData;
  categories: Category[];
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setServerError(null);
    setSubmitting(true);
    const result = await submitForReview();
    setSubmitting(false);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onSubmitted();
  }

  const catNames = initial.categories
    .map((c) => categories.find((cat) => cat.id === c.categoryId)?.name)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review & submit</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Review your profile before submitting for approval.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <div className="space-y-4">
        <ReviewSection title="Basic information">
          {initial.headline ? (
            <>
              <p className="font-medium">{initial.headline}</p>
              <p className="text-muted-foreground text-sm">{initial.bio}</p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              Not filled in — go back to step 1.
            </p>
          )}
        </ReviewSection>

        <ReviewSection title="Skills">
          {initial.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {initial.skills.map((s, i) => (
                <span key={i} className="bg-muted rounded-full px-2.5 py-0.5 text-xs">
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No skills added.</p>
          )}
        </ReviewSection>

        <ReviewSection title="Categories">
          {catNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {catNames.map((name, i) => (
                <span key={i} className="bg-muted rounded-full px-2.5 py-0.5 text-xs">
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No categories selected.</p>
          )}
        </ReviewSection>

        <ReviewSection title="Education">
          {initial.educations.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {initial.educations.map((e, i) => (
                <li key={i}>
                  {e.institution}
                  {e.degree ? ` · ${e.degree}` : ''}
                  {e.startYear ? ` (${e.startYear}–${e.endYear ?? 'present'})` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm italic">No education added.</p>
          )}
        </ReviewSection>

        <ReviewSection title="Experience">
          {initial.experiences.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {initial.experiences.map((e, i) => (
                <li key={i}>
                  {e.company} · {e.role}
                  {e.startYear ? ` (${e.startYear}–${e.endYear ?? 'present'})` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm italic">No experience added.</p>
          )}
        </ReviewSection>

        <ReviewSection title="Certificates">
          {initial.certificates.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {initial.certificates.map((c, i) => (
                <li key={i}>
                  {c.title}
                  {c.issuer ? ` · ${c.issuer}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm italic">No certificates added.</p>
          )}
        </ReviewSection>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit for approval'}
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-border rounded-lg border p-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

// ─── Submitted state ───────────────────────────────────────────────────────

function SubmittedBanner() {
  return (
    <div className="space-y-4 text-center">
      <div className="bg-primary/10 text-primary rounded-xl p-8">
        <p className="text-lg font-semibold">Application submitted!</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Our team will review your profile and notify you by email once a decision has been made.
        </p>
      </div>
      <a
        href="/dashboard"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
      >
        Go to dashboard
      </a>
    </div>
  );
}

// ─── Under review banner ───────────────────────────────────────────────────

function UnderReviewBanner() {
  return (
    <div className="space-y-4 text-center">
      <div className="bg-primary/10 text-primary rounded-xl p-8">
        <p className="text-lg font-semibold">Application under review</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Your tutor profile has been submitted and is being reviewed by our team. You&apos;ll
          receive an email once a decision has been made.
        </p>
      </div>
      <a
        href="/dashboard"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
      >
        Go to dashboard
      </a>
    </div>
  );
}

// ─── Main wizard ───────────────────────────────────────────────────────────

export function OnboardingWizard({ initialData, categories }: WizardProps) {
  const [wizardData, setWizardData] = useState<OnboardingData>(initialData);
  const isLocked = initialData.onboardingComplete && initialData.status !== 'REJECTED';
  const startStep = isLocked ? 6 : Math.min(Math.max(initialData.onboardingStep, 1), 6);
  const [step, setStep] = useState(startStep);
  const [submitted, setSubmitted] = useState(false);

  function advanceStep(patch: Partial<OnboardingData>) {
    setWizardData((prev) => ({ ...prev, ...patch }));
    setStep((s) => s + 1);
  }

  if (isLocked && !submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <UnderReviewBanner />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <SubmittedBanner />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Complete your tutor profile</h1>
      <ProgressBar currentStep={step} />

      {step === 1 && <Step1 initial={wizardData} onNext={(patch) => advanceStep(patch)} />}
      {step === 2 && (
        <Step2
          initial={wizardData}
          onNext={(patch) => advanceStep(patch)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          initial={wizardData}
          categories={categories}
          onNext={(patch) => advanceStep(patch)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4
          initial={wizardData}
          onNext={(patch) => advanceStep(patch)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <Step5
          initial={wizardData}
          onNext={(patch) => advanceStep(patch)}
          onBack={() => setStep(4)}
        />
      )}
      {step === 6 && (
        <Step6
          initial={wizardData}
          categories={categories}
          onBack={() => setStep(5)}
          onSubmitted={() => setSubmitted(true)}
        />
      )}

      <p className="text-muted-foreground mt-6 text-center text-xs">
        Your progress is saved automatically. You can safely leave and resume later.
      </p>
    </div>
  );
}
