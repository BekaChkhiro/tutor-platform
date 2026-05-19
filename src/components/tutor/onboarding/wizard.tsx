'use client';

import { useId, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/auth/photo-upload';
import { VideoUpload } from '@/components/auth/video-upload';
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
import { requestCertificateUploadUrl } from '@/server/actions/storage/certificate';

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
  introVideoUrl: string | null;
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
    fileUrl: string | null;
  }[];
}

interface WizardProps {
  initialData: OnboardingData;
  categories: Category[];
  commonSkills: string[];
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

// ─── Step 2: Photo & video ─────────────────────────────────────────────────

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
  const [introVideoUrl, setIntroVideoUrl] = useState<string | null>(initial.introVideoUrl);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Photo &amp; intro video</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          A professional photo and a short intro video help students choose the right tutor.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Profile photo
        </h3>
        <PhotoUpload currentPhotoUrl={photoUrl} onUploaded={(url) => setPhotoUrl(url)} />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">Intro video</h3>
        <p className="text-muted-foreground text-xs">
          Record a short video (up to 60 s) introducing yourself and your teaching style.
        </p>
        <VideoUpload
          currentVideoUrl={introVideoUrl}
          onUploaded={(url) => setIntroVideoUrl(url)}
          onDeleted={() => setIntroVideoUrl(null)}
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={() => onNext({ photoUrl, introVideoUrl })}>
          {photoUrl || introVideoUrl ? 'Save & continue' : 'Skip for now'}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Skills & categories ──────────────────────────────────────────

const MAX_SKILLS = 30;
const AUTOCOMPLETE_LIMIT = 8;

function SkillsEditor({
  skills,
  onChange,
  commonSkills,
  error,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
  commonSkills: string[];
  error?: string;
}) {
  const inputId = useId();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const suggestions = inputValue.trim()
    ? commonSkills
        .filter((s) => {
          const lower = s.toLowerCase();
          const query = inputValue.trim().toLowerCase();
          return !skills.includes(s) && (lower.startsWith(query) || lower.includes(query));
        })
        .slice(0, AUTOCOMPLETE_LIMIT)
    : [];

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (!trimmed || skills.includes(trimmed) || skills.length >= MAX_SKILLS) return;
    onChange([...skills, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex((s) => s === active.id);
      const newIndex = skills.findIndex((s) => s === over.id);
      onChange(arrayMove(skills, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium">
          Skills
        </label>
        <span className="text-muted-foreground text-xs">
          {skills.length} / {MAX_SKILLS}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">
        Press Enter, comma, or Tab to add. Drag chips to reorder.
      </p>

      <div
        ref={containerRef}
        className={cn(
          'border-border bg-background min-h-[2.75rem] rounded-lg border p-2',
          'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3',
          error &&
            'border-destructive focus-within:border-destructive focus-within:ring-destructive/20',
        )}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={skills} strategy={verticalListSortingStrategy}>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <SortableSkillChip key={skill} skill={skill} onRemove={removeSkill} />
              ))}
              {skills.length < MAX_SKILLS && (
                <div className="relative">
                  <input
                    ref={inputRef}
                    id={inputId}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="min-w-[120px] bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    placeholder={skills.length === 0 ? 'Type a skill…' : ''}
                    aria-label="Add a skill"
                    aria-autocomplete="list"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul
                      role="listbox"
                      className="border-border bg-background absolute top-full left-0 z-10 mt-1 w-48 rounded-lg border py-1 shadow-md"
                    >
                      {suggestions.map((s) => (
                        <li
                          key={s}
                          role="option"
                          aria-selected={false}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addSkill(s);
                          }}
                          className="hover:bg-muted cursor-pointer px-3 py-1.5 text-sm"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

function SortableSkillChip({
  skill,
  onRemove,
}: {
  skill: string;
  onRemove: (skill: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: skill,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none select-none"
        aria-label={`Drag to reorder ${skill}`}
      >
        ⠿
      </span>
      <span>{skill}</span>
      <button
        type="button"
        onClick={() => onRemove(skill)}
        className="hover:text-destructive ml-0.5 leading-none"
        aria-label={`Remove ${skill}`}
      >
        ×
      </button>
    </div>
  );
}

function Step3({
  initial,
  categories,
  commonSkills,
  onNext,
  onBack,
}: {
  initial: OnboardingData;
  categories: Category[];
  commonSkills: string[];
  onNext: (patch: Partial<OnboardingData>) => void;
  onBack: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>(initial.skills.map((s) => s.name));
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

      <SkillsEditor
        skills={skills}
        onChange={setSkills}
        commonSkills={commonSkills}
        error={skillError ?? undefined}
      />

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

// ─── Shared: SortableItem wrapper ─────────────────────────────────────────

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (handleProps: Record<string, unknown>) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners })}
    </div>
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
  const [eduDeleteConfirm, setEduDeleteConfirm] = useState<number | null>(null);
  const [expDeleteConfirm, setExpDeleteConfirm] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
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
              isPresent: e.endYear === null && e.startYear !== null ? true : false,
              description: e.description ?? undefined,
            }))
          : [],
    },
  });

  const {
    fields: eduFields,
    append: addEdu,
    remove: removeEdu,
    move: moveEdu,
  } = useFieldArray({ control, name: 'educations' });

  const {
    fields: expFields,
    append: addExp,
    remove: removeExp,
    move: moveExp,
  } = useFieldArray({ control, name: 'experiences' });

  const expValues = watch('experiences');

  const eduSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const expSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleEduDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = eduFields.findIndex((f) => f.id === active.id);
      const newIndex = eduFields.findIndex((f) => f.id === over.id);
      moveEdu(oldIndex, newIndex);
    }
  }

  function handleExpDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = expFields.findIndex((f) => f.id === active.id);
      const newIndex = expFields.findIndex((f) => f.id === over.id);
      moveExp(oldIndex, newIndex);
    }
  }

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
        endYear: e.isPresent ? null : (e.endYear ?? null),
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

      {/* Education */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">Education</h3>
          {eduFields.length < 10 && (
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
          )}
        </div>

        <DndContext
          sensors={eduSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleEduDragEnd}
        >
          <SortableContext
            items={eduFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {eduFields.map((field, i) => (
                <SortableItem key={field.id} id={field.id}>
                  {(handleProps) => (
                    <div className="border-border space-y-3 rounded-lg border p-4">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          {...handleProps}
                          className="text-muted-foreground mt-1 cursor-grab touch-none text-lg leading-none select-none"
                          aria-label="Drag to reorder"
                        >
                          ⠿
                        </button>
                        <div className="grid flex-1 gap-3 sm:grid-cols-2">
                          <Field
                            label="Institution"
                            error={
                              (
                                errors.educations?.[i]?.institution as
                                  | { message?: string }
                                  | undefined
                              )?.message
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
                        <div className="mt-1 flex flex-col items-center">
                          {eduDeleteConfirm === i ? (
                            <div className="border-border flex items-center gap-1 rounded-lg border px-2 py-1 text-xs">
                              <span className="text-muted-foreground">Sure?</span>
                              <button
                                type="button"
                                onClick={() => setEduDeleteConfirm(null)}
                                className="hover:text-foreground text-muted-foreground"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  removeEdu(i);
                                  setEduDeleteConfirm(null);
                                }}
                                className="text-destructive font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEduDeleteConfirm(i)}
                              className="text-muted-foreground hover:text-destructive text-lg leading-none"
                              aria-label="Remove education entry"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Experience */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            Experience
          </h3>
          {expFields.length < 15 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                addExp({
                  company: '',
                  role: '',
                  startYear: null,
                  endYear: null,
                  isPresent: false,
                  description: '',
                })
              }
            >
              + Add
            </Button>
          )}
        </div>

        <DndContext
          sensors={expSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleExpDragEnd}
        >
          <SortableContext
            items={expFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {expFields.map((field, i) => {
                const isPresent = expValues?.[i]?.isPresent ?? false;
                return (
                  <SortableItem key={field.id} id={field.id}>
                    {(handleProps) => (
                      <div className="border-border space-y-3 rounded-lg border p-4">
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            {...handleProps}
                            className="text-muted-foreground mt-1 cursor-grab touch-none text-lg leading-none select-none"
                            aria-label="Drag to reorder"
                          >
                            ⠿
                          </button>
                          <div className="grid flex-1 gap-3 sm:grid-cols-2">
                            <Field
                              label="Company"
                              error={
                                (
                                  errors.experiences?.[i]?.company as
                                    | { message?: string }
                                    | undefined
                                )?.message
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
                                (errors.experiences?.[i]?.role as { message?: string } | undefined)
                                  ?.message
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
                                  {...register(`experiences.${i}.startYear`, {
                                    valueAsNumber: true,
                                  })}
                                  type="number"
                                  className={inputCls()}
                                  placeholder="2018"
                                />
                              </Field>
                              {!isPresent && (
                                <Field label="End year">
                                  <input
                                    {...register(`experiences.${i}.endYear`, {
                                      valueAsNumber: true,
                                    })}
                                    type="number"
                                    className={inputCls()}
                                    placeholder="2022"
                                  />
                                </Field>
                              )}
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                id={`exp-present-${field.id}`}
                                type="checkbox"
                                {...register(`experiences.${i}.isPresent`)}
                                className="accent-primary h-4 w-4"
                              />
                              <label htmlFor={`exp-present-${field.id}`} className="text-sm">
                                Currently working here
                              </label>
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
                          <div className="mt-1 flex flex-col items-center">
                            {expDeleteConfirm === i ? (
                              <div className="border-border flex items-center gap-1 rounded-lg border px-2 py-1 text-xs">
                                <span className="text-muted-foreground">Sure?</span>
                                <button
                                  type="button"
                                  onClick={() => setExpDeleteConfirm(null)}
                                  className="hover:text-foreground text-muted-foreground"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeExp(i);
                                    setExpDeleteConfirm(null);
                                  }}
                                  className="text-destructive font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setExpDeleteConfirm(i)}
                                className="text-muted-foreground hover:text-destructive text-lg leading-none"
                                aria-label="Remove experience entry"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
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

type CertUploadState = 'idle' | 'uploading' | 'done' | 'error';

function CertFileUpload({
  index,
  fileUrl,
  onFileUrl,
}: {
  index: number;
  fileUrl: string | null | undefined;
  onFileUrl: (url: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<CertUploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState('uploading');
    setUploadError(null);
    setFileName(file.name);

    const result = await requestCertificateUploadUrl(file.type);
    if (!result.success) {
      setUploadState('error');
      setUploadError(result.error);
      return;
    }

    try {
      const res = await fetch(result.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!res.ok) throw new Error('Upload failed');
      setUploadState('done');
      onFileUrl(result.data.publicUrl);
    } catch {
      setUploadState('error');
      setUploadError('Upload failed. Please try again.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleRemove() {
    setUploadState('idle');
    setFileName(null);
    setUploadError(null);
    onFileUrl(null);
  }

  const existingUrl = fileUrl;

  return (
    <div className="space-y-1">
      <input
        ref={fileInputRef}
        id={`cert-file-${index}`}
        type="file"
        accept=".pdf,image/*"
        className="sr-only"
        aria-label="Upload certificate file"
        onChange={handleFileChange}
      />
      {existingUrl && uploadState !== 'uploading' ? (
        <div className="flex items-center gap-2 text-sm">
          <a
            href={existingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {fileName ?? 'Uploaded file'}
          </a>
          <button
            type="button"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive text-xs"
          >
            Remove
          </button>
        </div>
      ) : uploadState === 'uploading' ? (
        <p className="text-muted-foreground text-sm">Uploading…</p>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload file (PDF/image)
        </Button>
      )}
      {uploadState === 'error' && uploadError && (
        <p className="text-destructive text-xs">{uploadError}</p>
      )}
    </div>
  );
}

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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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
              issuedAt: c.issuedAt ? toDateInputValue(new Date(c.issuedAt)) : null,
              fileUrl: c.fileUrl ?? null,
            }))
          : [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: 'certificates' });
  const certValues = watch('certificates');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  }

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
        fileUrl: c.fileUrl ?? null,
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field, i) => (
              <SortableItem key={field.id} id={field.id}>
                {(handleProps) => (
                  <div className="border-border space-y-3 rounded-lg border p-4">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        {...handleProps}
                        className="text-muted-foreground mt-1 cursor-grab touch-none text-lg leading-none select-none"
                        aria-label="Drag to reorder"
                      >
                        ⠿
                      </button>
                      <div className="grid flex-1 gap-3 sm:grid-cols-2">
                        <Field
                          label="Certificate title"
                          error={
                            (errors.certificates?.[i]?.title as { message?: string } | undefined)
                              ?.message
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
                        <div className="space-y-1.5">
                          <span className="text-sm font-medium">Certificate file</span>
                          <CertFileUpload
                            index={i}
                            fileUrl={certValues?.[i]?.fileUrl}
                            onFileUrl={(url) =>
                              setValue(`certificates.${i}.fileUrl`, url, {
                                shouldDirty: true,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-1 flex flex-col items-center">
                        {deleteConfirm === i ? (
                          <div className="border-border flex items-center gap-1 rounded-lg border px-2 py-1 text-xs">
                            <span className="text-muted-foreground">Sure?</span>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(null)}
                              className="hover:text-foreground text-muted-foreground"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                remove(i);
                                setDeleteConfirm(null);
                              }}
                              className="text-destructive font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(i)}
                            className="text-muted-foreground hover:text-destructive text-lg leading-none"
                            aria-label="Remove certificate"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {fields.length < 20 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: '', issuer: '', issuedAt: null, fileUrl: null })}
        >
          + Add certificate
        </Button>
      )}

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

export function OnboardingWizard({ initialData, categories, commonSkills }: WizardProps) {
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
          commonSkills={commonSkills}
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
