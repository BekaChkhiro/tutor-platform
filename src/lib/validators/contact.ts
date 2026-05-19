import { z } from 'zod';

export const CONTACT_SUBJECTS = [
  'ზოგადი კითხვა',
  'ტექნიკური პრობლემა',
  'გადახდა და ანგარიშსწორება',
  'პარტნიორობა',
  'დარღვევის შეტყობინება',
  'სხვა',
] as const;

export const contactSchema = z.object({
  name: z.string().min(2, { message: 'სახელი სავალდებულოა' }).max(100),
  email: z.email('ელ-ფოსტა არასწორია'),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z
    .string()
    .min(10, { message: 'შეტყობინება ძალიან მოკლეა' })
    .max(2000, { message: 'შეტყობინება ძალიან გრძელია' }),
});

export type ContactInput = z.input<typeof contactSchema>;
