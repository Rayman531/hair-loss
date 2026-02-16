import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { progressSessions } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadToR2, generatePhotoKey, validateR2Env, type R2Env } from '../lib/r2';

type Env = {
  DATABASE_URL: string;
} & R2Env;

type Variables = {
  userId: string;
};

const REQUIRED_ANGLES = ['front', 'top', 'right', 'left'] as const;
type Angle = (typeof REQUIRED_ANGLES)[number];

const progress = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth guard: extract userId from X-User-Id header
progress.use('*', async (c, next) => {
  const userId = c.req.header('X-User-Id');
  if (!userId) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing user authentication' } }, 401);
  }
  c.set('userId', userId);
  await next();
});

// POST /api/progress/upload — upload 4 scalp photos and create a session
progress.post('/upload', async (c) => {
  try {
    const userId = c.get('userId');

    // Validate R2 env vars are present
    const r2Check = validateR2Env(c.env);
    if (!r2Check.valid) {
      console.error(`[Progress] Missing R2 env vars: ${r2Check.missing.join(', ')}`);
      return c.json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: `Server misconfiguration: missing R2 environment variables (${r2Check.missing.join(', ')})`,
        },
      }, 500);
    }

    const formData = await c.req.formData();

    // Extract note (optional)
    const rawNote = formData.get('note');
    const note = typeof rawNote === 'string' ? rawNote : null;

    // Validate all 4 angle images are present
    const images: Record<Angle, File> = {} as Record<Angle, File>;
    const missing: string[] = [];

    for (const angle of REQUIRED_ANGLES) {
      const file = formData.get(angle);
      console.log(`[Progress] Angle ${angle}: type=${typeof file}, isFile=${file instanceof File}, isBlob=${file instanceof Blob}`);
      if (file instanceof Blob && file.size > 0) {
        // Accept both File and Blob — convert Blob to File if needed
        const asFile = file instanceof File
          ? file
          : new File([file], `${angle}.jpg`, { type: file.type || 'image/jpeg' });
        images[angle] = asFile;
      } else {
        missing.push(angle);
      }
    }

    if (missing.length > 0) {
      return c.json({
        success: false,
        error: {
          code: 'MISSING_IMAGES',
          message: `Missing required images: ${missing.join(', ')}`,
        },
      }, 400);
    }

    // Upload all 4 images to R2
    console.log(`[Progress] Starting upload for user ${userId} (4 images)`);
    const urls: Record<Angle, string> = {} as Record<Angle, string>;

    await Promise.all(
      REQUIRED_ANGLES.map(async (angle) => {
        const key = generatePhotoKey(userId, angle);
        urls[angle] = await uploadToR2(c.env, images[angle], key);
      }),
    );

    // Store session in database
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const [session] = await db
      .insert(progressSessions)
      .values({
        userId,
        note,
        frontImageUrl: urls.front,
        topImageUrl: urls.top,
        rightImageUrl: urls.right,
        leftImageUrl: urls.left,
      })
      .returning();

    console.log(`[Progress] Session created: ${session.id} for user ${userId}`);

    return c.json({ success: true, data: session }, 201);
  } catch (error) {
    console.error('Error uploading progress photos:', error);
    return c.json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload progress photos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

// GET /api/progress — return all sessions for the authenticated user
progress.get('/', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');

    const sessions = await db
      .select()
      .from(progressSessions)
      .where(eq(progressSessions.userId, userId))
      .orderBy(desc(progressSessions.createdAt));

    return c.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching progress sessions:', error);
    return c.json({
      success: false,
      error: {
        code: 'FETCH_SESSIONS_ERROR',
        message: 'Failed to fetch progress sessions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

export default progress;
