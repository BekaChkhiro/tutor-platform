'use server';

import crypto from 'node:crypto';
import { auth } from '@/lib/auth/auth';
import { presignedPutUrl, certificateFilePublicUrl } from '@/lib/storage/r2';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function requestCertificateUploadUrl(
  contentType: string,
): Promise<ActionResult<{ uploadUrl: string; publicUrl: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return { success: false, error: 'Only PDF, JPEG, PNG, or WebP files are allowed' };
  }

  const uuid = crypto.randomUUID();
  const key = `certificates/${session.user.id}/${uuid}${ext}`;
  const uploadUrl = await presignedPutUrl(key, contentType);
  const publicUrl = certificateFilePublicUrl(key);

  return { success: true, data: { uploadUrl, publicUrl } };
}
