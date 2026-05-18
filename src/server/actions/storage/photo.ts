'use server';

import crypto from 'node:crypto';
import sharp from 'sharp';
import { auth } from '@/lib/auth/auth';
import {
  createPresignedUploadUrl,
  putObject,
  deleteObject,
  getObjectBuffer,
  publicUrl,
} from '@/lib/storage/r2';
import { prisma } from '@/lib/db/prisma';
import type { ActionResult } from '@/server/actions/auth/register';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

const VARIANTS = [200, 400, 800] as const;

export type UploadUrlPayload = { uploadUrl: string; key: string };

export async function requestUploadUrl(
  contentType: string,
): Promise<ActionResult<UploadUrlPayload>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  if (!ALLOWED_CONTENT_TYPES.includes(contentType as AllowedContentType)) {
    return { success: false, error: 'File type not allowed. Use JPEG, PNG, or WebP.' };
  }

  const ext = contentType.split('/')[1];
  const nonce = crypto.randomBytes(8).toString('hex');
  const key = `profile_photos/raw/${session.user.id}/${nonce}.${ext}`;

  const uploadUrl = await createPresignedUploadUrl(key, contentType);
  return { success: true, data: { uploadUrl, key } };
}

export async function finalizePhoto(rawKey: string): Promise<ActionResult<{ photoUrl: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  // Ensure the key belongs to this user (prevent unauthorized access to other users' raw uploads)
  if (!rawKey.includes(`/raw/${session.user.id}/`)) {
    return { success: false, error: 'Invalid key' };
  }

  const rawBuffer = await getObjectBuffer(rawKey);

  // Delete previous photo variants if they exist
  const existing = await prisma.tutor.findUnique({
    where: { userId: session.user.id },
    select: { photoUrl: true },
  });

  if (existing?.photoUrl) {
    await Promise.allSettled(
      VARIANTS.map((size) =>
        deleteObject(`profile_photos/${session.user.id}/${size}.webp`),
      ),
    );
  }

  // Generate and upload size variants
  await Promise.all(
    VARIANTS.map(async (size) => {
      const variantBuffer = await sharp(rawBuffer)
        .resize(size, size, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toBuffer();

      await putObject(`profile_photos/${session.user.id}/${size}.webp`, variantBuffer, 'image/webp');
    }),
  );

  // Delete raw upload now that variants are generated
  await deleteObject(rawKey);

  const basePhotoUrl = publicUrl(`profile_photos/${session.user.id}/800.webp`);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: basePhotoUrl },
  });

  await prisma.tutor.updateMany({
    where: { userId: session.user.id },
    data: { photoUrl: basePhotoUrl },
  });

  return { success: true, data: { photoUrl: basePhotoUrl } };
}

