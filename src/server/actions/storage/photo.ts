'use server';

import sharp from 'sharp';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import {
  presignedPutUrl,
  getObjectBuffer,
  putObject,
  deleteObject,
  deleteObjectsByPrefix,
  photoVariantUrl,
} from '@/lib/storage/r2';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const SIZES = [200, 400, 800] as const;

export async function requestUploadUrl(
  contentType: string,
): Promise<ActionResult<{ uploadUrl: string; key: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  if (!ALLOWED_TYPES.has(contentType)) {
    return { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  const key = `profile_photos/${session.user.id}/raw`;
  const uploadUrl = await presignedPutUrl(key, contentType);
  return { success: true, data: { uploadUrl, key } };
}

export async function finalizePhoto(): Promise<ActionResult<{ photoUrl: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const userId = session.user.id;
  const rawKey = `profile_photos/${userId}/raw`;

  let rawBuffer: Buffer;
  try {
    rawBuffer = await getObjectBuffer(rawKey);
  } catch {
    return { success: false, error: 'Raw upload not found — please try uploading again.' };
  }

  // Delete existing variants before writing new ones.
  await deleteObjectsByPrefix(`profile_photos/${userId}/`);

  await Promise.all(
    SIZES.map(async (size) => {
      const variant = await sharp(rawBuffer)
        .resize(size, size, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toBuffer();
      await putObject(`profile_photos/${userId}/${size}.webp`, variant, 'image/webp');
    }),
  );

  await deleteObject(rawKey);

  const photoUrl = photoVariantUrl(userId, 400);

  const tutorExists = await prisma.tutor.findUnique({
    where: { userId },
    select: { id: true },
  });

  await prisma.user.update({ where: { id: userId }, data: { image: photoUrl } });
  if (tutorExists) {
    await prisma.tutor.update({ where: { userId }, data: { photoUrl } });
  }

  return { success: true, data: { photoUrl } };
}
