import { z } from 'zod';

const GE_PHONE_RE = /^\+995\d{9}$/;
const GE_PHONE_STRIPPED_RE = /^\+995\d{9}$/;

export function isAtLeast18(dobString: string): boolean {
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return dob <= cutoff;
}

export function maskGeorgianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '+995 ';
  const local = digits.startsWith('995') ? digits.slice(3) : digits;
  const part1 = local.slice(0, 3);
  const part2 = local.slice(3, 6);
  const part3 = local.slice(6, 9);
  return ['+995', part1, part2, part3].filter(Boolean).join(' ').trim();
}

function stripSpaces(v: string) {
  return v.replace(/\s+/g, '');
}

// ─── Form schemas (string-only, no transforms — compatible with react-hook-form) ───

const phoneFormSchema = z
  .string()
  .trim()
  .refine((v) => GE_PHONE_RE.test(stripSpaces(v)), {
    message: 'Phone must be a valid Georgian number (+995XXXXXXXXX)',
  });

const dobFormSchema = z
  .string()
  .date('Invalid date — use YYYY-MM-DD')
  .refine(isAtLeast18, 'You must be at least 18 years old to register');

const passwordFormSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one digit');

export const userRegistrationFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.email('Invalid email address'),
    phone: phoneFormSchema,
    dob: dobFormSchema,
    password: passwordFormSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const tutorRegistrationFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.email('Invalid email address'),
    phone: phoneFormSchema,
    dob: dobFormSchema,
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      error: 'Please select a gender',
    }),
    password: passwordFormSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const completeProfileFormSchema = z.object({
  phone: phoneFormSchema,
  dob: dobFormSchema,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

// ─── Server schemas (with transforms — used in server actions only) ───

const phoneServerSchema = z
  .string()
  .trim()
  .transform(stripSpaces)
  .pipe(z.string().regex(GE_PHONE_STRIPPED_RE, 'Invalid phone'));

const dobServerSchema = z
  .string()
  .date()
  .transform((s) => new Date(s))
  .refine((d) => {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    return d <= cutoff;
  }, 'You must be at least 18 years old');

const passwordServerSchema = z
  .string()
  .min(8)
  .regex(/[a-zA-Z]/)
  .regex(/[0-9]/);

export const userRegistrationSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.email(),
    phone: phoneServerSchema,
    dob: dobServerSchema,
    password: passwordServerSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const tutorRegistrationSchema = z
  .object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    email: z.email(),
    phone: phoneServerSchema,
    dob: dobServerSchema,
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    password: passwordServerSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const completeProfileSchema = z.object({
  phone: phoneServerSchema,
  dob: dobServerSchema,
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export type UserRegistrationInput = z.input<typeof userRegistrationFormSchema>;
export type TutorRegistrationInput = z.input<typeof tutorRegistrationFormSchema>;
export type CompleteProfileInput = z.input<typeof completeProfileFormSchema>;
