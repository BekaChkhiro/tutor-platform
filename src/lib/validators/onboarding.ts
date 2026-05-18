import { z } from 'zod';

export const step1Schema = z.object({
  headline: z
    .string()
    .trim()
    .min(10, 'Headline must be at least 10 characters')
    .max(120, 'Max 120 characters'),
  bio: z
    .string()
    .trim()
    .min(50, 'Bio must be at least 50 characters')
    .max(2000, 'Max 2000 characters'),
});

export const step3Schema = z.object({
  skills: z
    .array(z.object({ name: z.string().trim().min(1, 'Skill name cannot be empty') }))
    .min(1, 'Add at least one skill'),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
});

export const step4Schema = z.object({
  educations: z.array(
    z.object({
      institution: z.string().trim().min(1, 'Institution is required'),
      degree: z.string().trim().optional(),
      fieldOfStudy: z.string().trim().optional(),
      startYear: z.number().int().min(1950).max(2030).optional().nullable(),
      endYear: z.number().int().min(1950).max(2030).optional().nullable(),
    }),
  ),
  experiences: z.array(
    z.object({
      company: z.string().trim().min(1, 'Company is required'),
      role: z.string().trim().min(1, 'Role is required'),
      startYear: z.number().int().min(1950).max(2030).optional().nullable(),
      endYear: z.number().int().min(1950).max(2030).optional().nullable(),
      description: z.string().trim().optional(),
    }),
  ),
});

export const step5Schema = z.object({
  certificates: z.array(
    z.object({
      title: z.string().trim().min(1, 'Title is required'),
      issuer: z.string().trim().optional(),
      issuedAt: z.string().date().optional().nullable(),
    }),
  ),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
