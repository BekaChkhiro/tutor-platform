import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) throw new Error('R2_ACCOUNT_ID not configured');
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  });
}

function bucket() {
  const b = process.env.R2_BUCKET;
  if (!b) throw new Error('R2_BUCKET not configured');
  return b;
}

export async function presignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  return getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }),
    { expiresIn },
  );
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const resp = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  const chunks: Uint8Array[] = [];
  for await (const chunk of resp.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await client().send(
    new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function deleteObjectsByPrefix(prefix: string): Promise<void> {
  const r2 = client();
  const b = bucket();
  const listed = await r2.send(new ListObjectsV2Command({ Bucket: b, Prefix: prefix }));
  const keys = (listed.Contents ?? []).map((o) => o.Key).filter(Boolean) as string[];
  await Promise.all(keys.map((k) => r2.send(new DeleteObjectCommand({ Bucket: b, Key: k }))));
}

export function photoVariantUrl(userId: string, size: 200 | 400 | 800): string {
  const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}/profile_photos/${userId}/${size}.webp`;
}

export function introVideoPublicUrl(userId: string): string {
  const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}/intro_videos/${userId}/video`;
}

export function introPosterPublicUrl(userId: string): string {
  const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}/intro_videos/${userId}/poster.jpg`;
}

export function certificateFilePublicUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '');
  return `${base}/${key}`;
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await client().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return true;
  } catch {
    return false;
  }
}
