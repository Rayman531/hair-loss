import { Hono } from 'hono'
import { cors } from 'hono/cors'
import onboarding from './routes/onboarding'
import routine from './routes/routine'
import dashboard from './routes/dashboard'
import progress from './routes/progress'
import tracker from './routes/tracker'

type Env = {
  DATABASE_URL: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;
};

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for all origins (you can restrict this in production)
app.use('/*', cors())

app.get('/', (c) => {
  return c.text('Hair Loss!')
})

// Mount onboarding routes
app.route('/api/onboarding', onboarding)

// Mount routine routes
app.route('/api/routine', routine)

// Mount dashboard routes
app.route('/api/dashboard', dashboard)

// Mount progress photo routes
app.route('/api/progress', progress)

// Mount routine tracker routes
app.route('/api/tracker', tracker)

export default app
