'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  step1Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  type Step1Data,
  type Step3Data,
  type Step4Data,
  type Step5Data,
} from '@/lib/validators/onboarding';
import {
  saveStep1,
  saveStep3,
  saveStep4,
  saveStep5,
  submitWizard,
} from '@/server/actions/tutors/onboarding';
import type { WizardData } from '@/server/actions/tutors/onboarding';

const STEPS = [
  'Basic info',
  'Media',
  'Skills & categories',
  'Education & experience',
  'Certificates',
  'Review & submit',
];

interface Category {
  id: string;
  name: string;
}

interface OnboardingWizardProps {
  initialData: WizardData;
  categories: Category[];
}

function getInitialStep(data: WizardData): number {
  if (data.onboardingComplete) return 6;
  return Math.min(data.onboardingStep + 1, 6);
}

export function OnboardingWizard({ initialData, categories }: OnboardingWizardProps) {
  const router = useRouter();
  const isLocked = initialData.onboardingComplete && initialData.status === 'PENDING_REVIEW';
  const isRejected = initialData.status === 'REJECTED';
  const canEdit = !isLocked || isRejected;

  const [currentStep, setCurrentStep] = useState(() =>
    isLocked ? 6 : getInitialStep(initialData),
  );

  function goTo(step: number) {
    setCurrentStep(Math.max(1, Math.min(step, 6)));
  }

  function handleSaveAndExit() {
    router.push('/tutor/dashboard');
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8">
      <WizardHeader currentStep={currentStep} isLocked={isLocked} />

      {isLocked && <PendingReviewBanner />}
      {isRejected && <RejectedBanner />}

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        {currentStep === 1 && (
          <Step1BasicInfo initialData={initialData} locked={!canEdit} onNext={() => goTo(2)} />
        )}
        {currentStep === 2 && (
          <Step2Media
            initialData={initialData}
            locked={!canEdit}
            onBack={() => goTo(1)}
            onNext={() => goTo(3)}
          />
        )}
        {currentStep === 3 && (
          <Step3SkillsCategories
            initialData={initialData}
            categories={categories}
            locked={!canEdit}
            onBack={() => goTo(2)}
            onNext={() => goTo(4)}
          />
        )}
        {currentStep === 4 && (
          <Step4EducationExperience
            initialData={initialData}
            locked={!canEdit}
            onBack={() => goTo(3)}
            onNext={() => goTo(5)}
          />
        )}
        {currentStep === 5 && (
          <Step5Certificates
            initialData={initialData}
            locked={!canEdit}
            onBack={() => goTo(4)}
            onNext={() => goTo(6)}
          />
        )}
        {currentStep === 6 && (
          <Step6Review
            initialData={initialData}
            categories={categories}
            locked={isLocked}
            onBack={() => goTo(5)}
            onResubmit={isRejected ? () => goTo(1) : undefined}
          />
        )}
      </div>

      {!isLocked && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveAndExit}
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            Save & exit
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Wizard header ────────────────────────────────────────────────────────────

function WizardHeader({ currentStep, isLocked }: { currentStep: number; isLocked: boolean }) {
  const pct = isLocked ? 100 : ((currentStep - 1) / (STEPS.length - 1)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Complete your tutor profile</h1>
        {!isLocked && (
          <span className="text-muted-foreground text-sm">
            Step {currentStep} of {STEPS.length}
          </span>
        )}
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="hidden grid-cols-6 sm:grid">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'truncate px-1 text-center text-xs',
              i + 1 === currentStep
                ? 'text-foreground font-medium'
                : i + 1 < currentStep
                  ? 'text-primary'
                  : 'text-muted-foreground',
            )}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingReviewBanner() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <strong>Submitted — awaiting review.</strong> Your profile has been submitted and is being
      reviewed. You cannot edit it while it is under review.
    </div>
  );
}

function RejectedBanner() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <strong>Application rejected.</strong> Please update your profile and re-submit.
    </div>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function inputCls(hasError: boolean, disabled?: boolean) {
  return cn(
    'border-border bg-background w-full rounded-lg border px-3 py-2 text-sm',
    'placeholder:text-muted-foreground',
    'focus:border-ring focus:ring-ring/50 focus:ring-3 focus:outline-none',
    hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
    disabled && 'cursor-not-allowed opacity-60',
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
  submitting,
  backLabel,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  submitting?: boolean;
  backLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          {backLabel ?? 'Back'}
        </Button>
      ) : (
        <div />
      )}
      {onNext && (
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : (nextLabel ?? 'Next')}
        </Button>
      )}
    </div>
  );
}

// ─── Step 1: Basic info ───────────────────────────────────────────────────────

function Step1BasicInfo({
  initialData,
  locked,
  onNext,
}: {
  initialData: WizardData;
  locked: boolean;
  onNext: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      headline: initialData.headline ?? '',
      bio: initialData.bio ?? '',
    },
  });

  async function onSubmit(data: Step1Data) {
    if (locked) return onNext();
    setServerError(null);
    const res = await saveStep1(data);
    if (!res.success) {
      setServerError(res.error);
      return;
    }
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-lg font-semibold">Basic info</h2>
        <p className="text-muted-foreground text-sm">Introduce yourself to potential clients.</p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <Field
        label="Headline"
        error={errors.headline?.message}
        hint="A short one-liner describing your expertise (10–120 chars)"
      >
        <input
          {...register('headline')}
          disabled={locked}
          className={inputCls(!!errors.headline, locked)}
          placeholder="e.g. Certified English teacher with 8 years of experience"
        />
      </Field>

      <Field
        label="Bio"
        error={errors.bio?.message}
        hint="Tell clients about yourself, your background, and what you offer (50–2000 chars)"
      >
        <textarea
          {...register('bio')}
          disabled={locked}
          rows={6}
          className={inputCls(!!errors.bio, locked)}
          placeholder="Describe your background, teaching style, and what clients can expect..."
        />
      </Field>

      <StepNav onNext={onSubmit as never} submitting={isSubmitting} nextLabel="Save & continue" />
    </form>
  );
}

// ─── Step 2: Media (placeholder) ─────────────────────────────────────────────

function Step2Media({
  initialData,
  locked,
  onBack,
  onNext,
}: {
  initialData: WizardData;
  locked: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Photo & intro video</h2>
        <p className="text-muted-foreground text-sm">
          Upload a profile photo and a short intro video.
        </p>
      </div>

      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {initialData.photoUrl ? (
            <span className="text-primary font-medium">Photo uploaded</span>
          ) : (
            'Photo upload will be available soon.'
          )}
        </p>
      </div>

      <div className="border-border bg-muted/30 rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {initialData.introVideoUrl ? (
            <span className="text-primary font-medium">Intro video uploaded</span>
          ) : (
            'Intro video upload will be available soon.'
          )}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={locked && false}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          {locked ? 'Next' : 'Skip for now'}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Skills + categories ─────────────────────────────────────────────

function Step3SkillsCategories({
  initialData,
  categories,
  locked,
  onBack,
  onNext,
}: {
  initialData: WizardData;
  categories: Category[];
  locked: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialData.categoryIds);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      skills: initialData.skills.length > 0 ? initialData.skills : [{ name: '' }],
      categoryIds: initialData.categoryIds,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'skills' });

  async function onSubmit(data: Step3Data) {
    if (locked) return onNext();
    setServerError(null);
    const res = await saveStep3(data);
    if (!res.success) {
      setServerError(res.error);
      return;
    }
    onNext();
  }

  function toggleCategory(id: string) {
    if (locked) return;
    const updated = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((c) => c !== id)
      : [...selectedCategoryIds, id];
    setSelectedCategoryIds(updated);
    setValue('categoryIds', updated, { shouldValidate: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-lg font-semibold">Skills & categories</h2>
        <p className="text-muted-foreground text-sm">
          List your skills and select the categories you teach in.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Skills</label>
        {(errors.skills as { message?: string } | undefined)?.message && (
          <p className="text-destructive text-xs">
            {(errors.skills as { message?: string }).message}
          </p>
        )}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`skills.${index}.name`)}
                disabled={locked}
                className={inputCls(!!errors.skills?.[index]?.name, locked)}
                placeholder="e.g. English grammar"
              />
              {!locked && fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive text-sm"
                  aria-label="Remove skill"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {!locked && (
          <button
            type="button"
            onClick={() => append({ name: '' })}
            className="text-primary text-sm hover:underline"
          >
            + Add skill
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Categories</label>
        {(errors.categoryIds as { message?: string } | undefined)?.message && (
          <p className="text-destructive text-xs">
            {(errors.categoryIds as { message?: string }).message}
          </p>
        )}
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">No categories available yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const selected = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={locked}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-foreground',
                    locked && 'cursor-not-allowed opacity-60',
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <StepNav
        onBack={onBack}
        onNext={onSubmit as never}
        submitting={isSubmitting}
        nextLabel="Save & continue"
      />
    </form>
  );
}

// ─── Step 4: Education + experience ──────────────────────────────────────────

function Step4EducationExperience({
  initialData,
  locked,
  onBack,
  onNext,
}: {
  initialData: WizardData;
  locked: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultEdu = initialData.educations.map((e) => ({
    institution: e.institution,
    degree: e.degree ?? '',
    fieldOfStudy: e.fieldOfStudy ?? '',
    startYear: e.startYear,
    endYear: e.endYear,
  }));
  const defaultExp = initialData.experiences.map((e) => ({
    company: e.company,
    role: e.role,
    startYear: e.startYear,
    endYear: e.endYear,
    description: e.description ?? '',
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      educations: defaultEdu.length > 0 ? defaultEdu : [],
      experiences: defaultExp.length > 0 ? defaultExp : [],
    },
  });

  const eduFields = useFieldArray({ control, name: 'educations' });
  const expFields = useFieldArray({ control, name: 'experiences' });

  async function onSubmit(data: Step4Data) {
    if (locked) return onNext();
    setServerError(null);
    const res = await saveStep4(data);
    if (!res.success) {
      setServerError(res.error);
      return;
    }
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <h2 className="text-lg font-semibold">Education & experience</h2>
        <p className="text-muted-foreground text-sm">
          Add your academic background and work history. Both sections are optional.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Education</h3>
          {!locked && (
            <button
              type="button"
              onClick={() =>
                eduFields.append({
                  institution: '',
                  degree: '',
                  fieldOfStudy: '',
                  startYear: null,
                  endYear: null,
                })
              }
              className="text-primary text-sm hover:underline"
            >
              + Add education
            </button>
          )}
        </div>
        {eduFields.fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">No education added.</p>
        ) : (
          <div className="space-y-4">
            {eduFields.fields.map((field, index) => (
              <div key={field.id} className="border-border space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    Education {index + 1}
                  </span>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => eduFields.remove(index)}
                      className="text-muted-foreground hover:text-destructive text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Field label="Institution" error={errors.educations?.[index]?.institution?.message}>
                  <input
                    {...register(`educations.${index}.institution`)}
                    disabled={locked}
                    className={inputCls(!!errors.educations?.[index]?.institution, locked)}
                    placeholder="University name"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Degree" error={undefined}>
                    <input
                      {...register(`educations.${index}.degree`)}
                      disabled={locked}
                      className={inputCls(false, locked)}
                      placeholder="e.g. Bachelor's"
                    />
                  </Field>
                  <Field label="Field of study" error={undefined}>
                    <input
                      {...register(`educations.${index}.fieldOfStudy`)}
                      disabled={locked}
                      className={inputCls(false, locked)}
                      placeholder="e.g. Linguistics"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start year" error={undefined}>
                    <input
                      {...register(`educations.${index}.startYear`, { valueAsNumber: true })}
                      type="number"
                      disabled={locked}
                      className={inputCls(false, locked)}
                      placeholder="2018"
                      min={1950}
                      max={2030}
                    />
                  </Field>
                  <Field label="End year" error={undefined}>
                    <input
                      {...register(`educations.${index}.endYear`, { valueAsNumber: true })}
                      type="number"
                      disabled={locked}
                      className={inputCls(false, locked)}
                      placeholder="2022"
                      min={1950}
                      max={2030}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Work experience</h3>
          {!locked && (
            <button
              type="button"
              onClick={() =>
                expFields.append({
                  company: '',
                  role: '',
                  startYear: null,
                  endYear: null,
                  description: '',
                })
              }
              className="text-primary text-sm hover:underline"
            >
              + Add experience
            </button>
          )}
        </div>
        {expFields.fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">No experience added.</p>
        ) : (
          <div className="space-y-4">
            {expFields.fields.map((field, index) => (
              <div key={field.id} className="border-border space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    Experience {index + 1}
                  </span>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => expFields.remove(index)}
                      className="text-muted-foreground hover:text-destructive text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company" error={errors.experiences?.[index]?.company?.message}>
                    <input
                      {...register(`experiences.${index}.company`)}
                      disabled={locked}
                      className={inputCls(!!errors.experiences?.[index]?.company, locked)}
                      placeholder="Company name"
                    />
                  </Field>
                  <Field label="Role" error={errors.experiences?.[index]?.role?.message}>
                    <input
                      {...register(`experiences.${index}.role`)}
                      disabled={locked}
                      className={inputCls(!!errors.experiences?.[index]?.role, locked)}
                      placeholder="e.g. Teacher"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start year" error={undefined}>
                    <input
                      {...register(`experiences.${index}.startYear`, { valueAsNumber: true })}
                      type="number"
                      disabled={locked}
                      className={inputCls(false, locked)}
                      placeholder="2018"
                      min={1950}
                      max={2030}
                    />
                  </Field>
                  <Field label="End year" error={undefined}>
                    <input
                      {...register(`experiences.${index}.endYear`, { valueAsNumber: true })}
                      type="number"
                      disabled={locked}
                      className={inputCls(false, locked)}
                      placeholder="2022 (leave empty if current)"
                      min={1950}
                      max={2030}
                    />
                  </Field>
                </div>
                <Field label="Description" error={undefined}>
                  <textarea
                    {...register(`experiences.${index}.description`)}
                    disabled={locked}
                    rows={3}
                    className={inputCls(false, locked)}
                    placeholder="Brief description of responsibilities..."
                  />
                </Field>
              </div>
            ))}
          </div>
        )}
      </div>

      <StepNav
        onBack={onBack}
        onNext={onSubmit as never}
        submitting={isSubmitting}
        nextLabel="Save & continue"
      />
    </form>
  );
}

// ─── Step 5: Certificates ─────────────────────────────────────────────────────

function Step5Certificates({
  initialData,
  locked,
  onBack,
  onNext,
}: {
  initialData: WizardData;
  locked: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultCerts = initialData.certificates.map((c) => ({
    title: c.title,
    issuer: c.issuer ?? '',
    issuedAt: c.issuedAt ? c.issuedAt.toISOString().split('T')[0] : '',
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: { certificates: defaultCerts },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'certificates' });

  async function onSubmit(data: Step5Data) {
    if (locked) return onNext();
    setServerError(null);
    const cleaned = {
      certificates: data.certificates.map((c) => ({
        ...c,
        issuedAt: c.issuedAt || null,
      })),
    };
    const res = await saveStep5(cleaned);
    if (!res.success) {
      setServerError(res.error);
      return;
    }
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-lg font-semibold">Certificates</h2>
        <p className="text-muted-foreground text-sm">
          Add any relevant certificates or qualifications. This section is optional.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      {fields.length === 0 ? (
        <p className="text-muted-foreground text-sm">No certificates added.</p>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border-border space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Certificate {index + 1}
                </span>
                {!locked && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <Field label="Title" error={errors.certificates?.[index]?.title?.message}>
                <input
                  {...register(`certificates.${index}.title`)}
                  disabled={locked}
                  className={inputCls(!!errors.certificates?.[index]?.title, locked)}
                  placeholder="Certificate name"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issuer" error={undefined}>
                  <input
                    {...register(`certificates.${index}.issuer`)}
                    disabled={locked}
                    className={inputCls(false, locked)}
                    placeholder="Issuing organisation"
                  />
                </Field>
                <Field label="Issue date" error={undefined}>
                  <input
                    {...register(`certificates.${index}.issuedAt`)}
                    type="date"
                    disabled={locked}
                    className={inputCls(false, locked)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}

      {!locked && (
        <button
          type="button"
          onClick={() => append({ title: '', issuer: '', issuedAt: '' })}
          className="text-primary text-sm hover:underline"
        >
          + Add certificate
        </button>
      )}

      <StepNav
        onBack={onBack}
        onNext={onSubmit as never}
        submitting={isSubmitting}
        nextLabel="Save & continue"
      />
    </form>
  );
}

// ─── Step 6: Review & submit ──────────────────────────────────────────────────

function Step6Review({
  initialData,
  categories,
  locked,
  onBack,
  onResubmit,
}: {
  initialData: WizardData;
  categories: Category[];
  locked: boolean;
  onBack: () => void;
  onResubmit?: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setServerError(null);
    setSubmitting(true);
    const res = await submitWizard();
    setSubmitting(false);
    if (!res.success) {
      setServerError(res.error);
      return;
    }
    router.refresh();
  }

  const categoryNames = categories
    .filter((c) => initialData.categoryIds.includes(c.id))
    .map((c) => c.name);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review & submit</h2>
        <p className="text-muted-foreground text-sm">
          Review your profile before submitting for approval.
        </p>
      </div>

      {serverError && (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm">
          {serverError}
        </p>
      )}

      <ReviewSection title="Basic info">
        <ReviewRow label="Headline" value={initialData.headline ?? '—'} />
        <ReviewRow label="Bio" value={initialData.bio ?? '—'} multiline />
      </ReviewSection>

      <ReviewSection title="Media">
        <ReviewRow label="Photo" value={initialData.photoUrl ? 'Uploaded' : 'Not uploaded yet'} />
        <ReviewRow
          label="Intro video"
          value={initialData.introVideoUrl ? 'Uploaded' : 'Not uploaded yet'}
        />
      </ReviewSection>

      <ReviewSection title="Skills & categories">
        <ReviewRow
          label="Skills"
          value={
            initialData.skills.length > 0 ? initialData.skills.map((s) => s.name).join(', ') : '—'
          }
        />
        <ReviewRow
          label="Categories"
          value={categoryNames.length > 0 ? categoryNames.join(', ') : '—'}
        />
      </ReviewSection>

      <ReviewSection title="Education">
        {initialData.educations.length === 0 ? (
          <p className="text-muted-foreground text-sm">None added.</p>
        ) : (
          initialData.educations.map((edu, i) => (
            <ReviewRow
              key={i}
              label={edu.institution}
              value={[edu.degree, edu.fieldOfStudy, edu.startYear, edu.endYear]
                .filter(Boolean)
                .join(' · ')}
            />
          ))
        )}
      </ReviewSection>

      <ReviewSection title="Work experience">
        {initialData.experiences.length === 0 ? (
          <p className="text-muted-foreground text-sm">None added.</p>
        ) : (
          initialData.experiences.map((exp, i) => (
            <ReviewRow
              key={i}
              label={`${exp.role} at ${exp.company}`}
              value={[exp.startYear, exp.endYear].filter(Boolean).join(' – ')}
            />
          ))
        )}
      </ReviewSection>

      <ReviewSection title="Certificates">
        {initialData.certificates.length === 0 ? (
          <p className="text-muted-foreground text-sm">None added.</p>
        ) : (
          initialData.certificates.map((cert, i) => (
            <ReviewRow key={i} label={cert.title} value={cert.issuer ?? ''} />
          ))
        )}
      </ReviewSection>

      <div className="mt-6 flex items-center justify-between">
        {!locked && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        {locked ? (
          <div />
        ) : onResubmit ? (
          <Button type="button" onClick={onResubmit}>
            Edit & re-submit
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        {title}
      </h3>
      <div className="border-border bg-muted/20 space-y-2 rounded-lg border p-4">{children}</div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className={cn('text-sm', multiline ? 'space-y-1' : 'flex gap-2')}>
      <span className="text-foreground min-w-24 shrink-0 font-medium">{label}:</span>
      <span className={cn('text-muted-foreground', multiline ? 'block whitespace-pre-wrap' : '')}>
        {value}
      </span>
    </div>
  );
}
