'use server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import {
  presignedPutUrl,
  objectExists,
  deleteObjectsByPrefix,
  introVideoPublicUrl,
  introPosterPublicUrl,
} from '@/lib/storage/r2';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

export async function requestVideoUploadUrl(
  contentType: string,
): Promise<ActionResult<{ uploadUrl: string; key: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
    return { success: false, error: 'Only MP4 and WebM videos are allowed' };
  }

  const key = `intro_videos/${session.user.id}/video`;
  const uploadUrl = await presignedPutUrl(key, contentType);
  return { success: true, data: { uploadUrl, key } };
}

export async function requestPosterUploadUrl(): Promise<
  ActionResult<{ uploadUrl: string; key: string }>
> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const key = `intro_videos/${session.user.id}/poster.jpg`;
  const uploadUrl = await presignedPutUrl(key, 'image/jpeg');
  return { success: true, data: { uploadUrl, key } };
}

export async function finalizeIntroVideo(): Promise<
  ActionResult<{ introVideoUrl: string; posterUrl: string | null }>
> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const userId = session.user.id;

  const tutorExists = await prisma.tutor.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!tutorExists) return { success: false, error: 'Tutor profile not found' };

  const videoKey = `intro_videos/${userId}/video`;
  const uploaded = await objectExists(videoKey);
  if (!uploaded) {
    return { success: false, error: 'Video upload not found — please try uploading again.' };
  }

  // Delete any previous video + poster before committing new URLs.
  // We skip the current video key intentionally — this just replaces the poster if any.
  // Full cleanup (old files) was already handled by overwriting the fixed key above.

  const videoUrl = introVideoPublicUrl(userId);
  const posterKey = `intro_videos/${userId}/poster.jpg`;
  const hasPoster = await objectExists(posterKey);
  const posterUrl = hasPoster ? introPosterPublicUrl(userId) : null;

  await prisma.tutor.update({
    where: { userId },
    data: { introVideoUrl: videoUrl },
  });

  return { success: true, data: { introVideoUrl: videoUrl, posterUrl } };
}

export async function deleteIntroVideo(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const userId = session.user.id;

  await deleteObjectsByPrefix(`intro_videos/${userId}/`);

  await prisma.tutor.update({
    where: { userId },
    data: { introVideoUrl: null },
  });

  return { success: true, data: undefined };
}
