export const CONTACT_SUBJECTS = [
  'General inquiry',
  'Technical issue',
  'Billing question',
  'Tutor application',
  'Partnership',
  'Report a problem',
  'Other',
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
