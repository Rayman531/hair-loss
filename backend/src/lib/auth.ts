import { verifyToken } from '@clerk/backend';

export async function extractUserId(
  authHeader: string | undefined,
  secretKey: string,
): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token, { secretKey });
    return payload.sub;
  } catch {
    return null;
  }
}
