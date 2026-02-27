import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export type R2Env = {
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
};

const R2_ENV_KEYS: (keyof R2Env)[] = [
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_ACCOUNT_ID',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
];

export function validateR2Env(env: Record<string, unknown>): { valid: boolean; missing: string[] } {
  const missing = R2_ENV_KEYS.filter((key) => !env[key]);
  return { valid: missing.length === 0, missing };
}

function createR2Client(env: R2Env) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadToR2(
  env: R2Env,
  file: File,
  key: string,
): Promise<string> {
  const client = createR2Client(env);
  const arrayBuffer = await file.arrayBuffer();

  console.log(`[R2] Uploading: ${key} (${file.size} bytes)`);

  await client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type || 'image/jpeg',
    }),
  );

  const publicUrl = env.R2_PUBLIC_URL.replace(/\/$/, '');
  const fullUrl = `${publicUrl}/${key}`;
  console.log(`[R2] Upload complete: ${key}`);
  return fullUrl;
}

export async function deleteFromR2(env: R2Env, key: string): Promise<void> {
  const client = createR2Client(env);
  console.log(`[R2] Deleting: ${key}`);
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
  console.log(`[R2] Delete complete: ${key}`);
}

export function extractR2Key(publicUrl: string, r2PublicUrl: string): string {
  const base = r2PublicUrl.replace(/\/$/, '');
  return publicUrl.replace(`${base}/`, '');
}

export function generatePhotoKey(
  userId: string,
  angle: string,
): string {
  const timestamp = Date.now();
  const randomId = crypto.randomUUID().slice(0, 8);
  return `progress/${userId}/${timestamp}-${angle}-${randomId}.jpg`;
}
