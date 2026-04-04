import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { log } from './lib/logger'
import { createPostHogClient } from './lib/posthog'
import onboarding from './routes/onboarding'
import dashboard from './routes/dashboard'
import progress from './routes/progress'
import tracker from './routes/tracker'
import feedbackRoutes from './routes/feedback'
import notifications from './routes/notifications'
import account from './routes/account'

type Env = {
  DATABASE_URL: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
  POSTHOG_API_KEY: string;
  POSTHOG_HOST: string;
};

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for all origins (you can restrict this in production)
app.use('/*', cors())

// Request logging middleware
app.use('/*', async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const userId = c.req.header('X-User-Id') ?? 'anon';

  await next();

  const ms = Date.now() - start;
  const status = c.res.status;

  log.info('request', { method, path, status, ms, userId });
})

// Global error handler
app.onError(async (err, c) => {
  const method = c.req.method;
  const path = c.req.path;
  const userId = c.req.header('X-User-Id') ?? 'anon';

  log.error('unhandled error', {
    method,
    path,
    userId,
    error: err.message,
    stack: err.stack,
  });

  const posthog = createPostHogClient(c.env)
  posthog.captureException(err, userId !== 'anon' ? userId : undefined, { method, path })
  await posthog.shutdown()

  return c.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  }, 500);
})

app.get('/', (c) => {
  return c.text('Hair Loss!')
})

app.route('/api/onboarding', onboarding)
app.route('/api/dashboard', dashboard)
app.route('/api/progress', progress)
app.route('/api/tracker', tracker)
app.route('/api/feedback', feedbackRoutes)
app.route('/api/notifications', notifications)
app.route('/api/account', account)

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const { createDrizzleConnection } = await import('./db/drizzle');
    const { processScheduledReminders } = await import('./services/notifications');

    ctx.waitUntil(
      (async () => {
        try {
          const db = createDrizzleConnection(env.DATABASE_URL);
          const count = await processScheduledReminders(db);
          log.info('cron reminders completed', { sent: count });
        } catch (error) {
          log.error('cron reminder failed', { error: error instanceof Error ? error.message : 'Unknown error' });
        }
      })()
    );
  },
}
