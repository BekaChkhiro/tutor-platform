import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export const BUCKET = process.env.R2_BUCKET ?? 'tutor-platform-assets';
export const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(r2Client(), cmd, { expiresIn });
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await r2Client().send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await r2Client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const res = await r2Client().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  if (!res.Body) throw new Error(`Empty response body for key: ${key}`);
  const bytes = await res.Body.transformToByteArray();
  return Buffer.from(bytes);
}

export function publicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function photoVariantUrl(userId: string, size: 200 | 400 | 800): string {
  return publicUrl(`profile_photos/${userId}/${size}.webp`);
}
