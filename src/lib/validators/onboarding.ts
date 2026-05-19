import { z } from 'zod';

export const step1Schema = z.object({
  headline: z
    .string()
    .trim()
    .min(10, 'Headline must be at least 10 characters')
    .max(120, 'Headline must be at most 120 characters'),
  bio: z
    .string()
    .trim()
    .min(50, 'Bio must be at least 50 characters')
    .max(2000, 'Bio must be at most 2000 characters'),
});

export const step3Schema = z.object({
  skills: z
    .array(z.string().trim().min(1).max(50))
    .min(1, 'Add at least one skill')
    .max(20, 'You can add at most 20 skills'),
  categoryIds: z
    .array(z.string())
    .min(1, 'Select at least one category')
    .max(5, 'Select at most 5 categories'),
});

const educationSchema = z.object({
  institution: z.string().trim().min(1, 'Institution name is required'),
  degree: z.string().trim().optional(),
  fieldOfStudy: z.string().trim().optional(),
  startYear: z.number().int().min(1950).max(2030).nullable().optional(),
  endYear: z.number().int().min(1950).max(2030).nullable().optional(),
});

const experienceSchema = z.object({
  company: z.string().trim().min(1, 'Company name is required'),
  role: z.string().trim().min(1, 'Role is required'),
  startYear: z.number().int().min(1950).max(2030).nullable().optional(),
  endYear: z.number().int().min(1950).max(2030).nullable().optional(),
  description: z.string().trim().max(500).optional(),
});

export const step4Schema = z.object({
  educations: z.array(educationSchema),
  experiences: z.array(experienceSchema),
});

const certificateSchema = z.object({
  title: z.string().trim().min(1, 'Certificate title is required'),
  issuer: z.string().trim().optional(),
  issuedAt: z.string().date().nullable().optional(),
});

export const step5Schema = z.object({
  certificates: z.array(certificateSchema),
});

export type Step1Input = z.infer<typeof step1Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5Input = z.infer<typeof step5Schema>;
