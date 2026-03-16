import { Hono } from 'hono';
import { createDrizzleConnection } from '../db/drizzle';
import { progressSessions } from '../db/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { uploadToR2, deleteFromR2, extractR2Key, generatePhotoKey, validateR2Env, type R2Env } from '../lib/r2';
import { log } from '../lib/logger';

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
      log.error('missing R2 env vars', { missing: r2Check.missing });
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
      log.info('progress upload angle', { angle, type: typeof file, isFile: file instanceof File, isBlob: file instanceof Blob });
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
    log.info('progress upload starting', { userId, imageCount: 4 });
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

    log.info('progress session created', { sessionId: session.id, userId });

    return c.json({ success: true, data: session }, 201);
  } catch (error) {
    log.error('progress upload failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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
      .where(and(eq(progressSessions.userId, userId), isNull(progressSessions.deletedAt)))
      .orderBy(desc(progressSessions.createdAt));

    return c.json({ success: true, data: sessions });
  } catch (error) {
    log.error('progress sessions fetch failed', { error: error instanceof Error ? error.message : 'Unknown error' });
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

// DELETE /api/progress/:id — soft-delete a session and remove its R2 photos
progress.delete('/:id', async (c) => {
  try {
    const db = createDrizzleConnection(c.env.DATABASE_URL);
    const userId = c.get('userId');
    const sessionId = Number(c.req.param('id'));

    // Fetch the session and verify ownership
    const [session] = await db
      .select()
      .from(progressSessions)
      .where(
        and(
          eq(progressSessions.id, sessionId),
          eq(progressSessions.userId, userId),
          isNull(progressSessions.deletedAt),
        ),
      );

    if (!session) {
      return c.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Progress session not found' },
      }, 404);
    }

    // Delete photos from R2 storage
    const imageUrls = [
      session.frontImageUrl,
      session.topImageUrl,
      session.rightImageUrl,
      session.leftImageUrl,
    ];

    const r2PublicUrl = c.env.R2_PUBLIC_URL;
    const deleteResults = await Promise.allSettled(
      imageUrls.map((url) => {
        const key = extractR2Key(url, r2PublicUrl);
        return deleteFromR2(c.env, key);
      }),
    );

    const failedDeletes = deleteResults.filter((r) => r.status === 'rejected');
    if (failedDeletes.length > 0) {
      log.warn('R2 deletions partially failed', {
        sessionId,
        failedCount: failedDeletes.length,
        reasons: failedDeletes.map((r) => String((r as PromiseRejectedResult).reason)),
      });
    }

    // Soft-delete the database record
    await db
      .update(progressSessions)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(progressSessions.id, sessionId),
          eq(progressSessions.userId, userId),
        ),
      );

    log.info('progress session deleted', { sessionId, userId });

    return c.json({ success: true, data: { id: sessionId } });
  } catch (error) {
    log.error('progress session delete failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return c.json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete progress session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

export default progress;
