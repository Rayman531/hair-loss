import { Hono } from 'hono'
import { cors } from 'hono/cors'
import onboarding from './routes/onboarding'

type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for all origins (you can restrict this in production)
app.use('/*', cors())

app.get('/', (c) => {
  return c.text('Hair Loss!')
})

// Mount onboarding routes
app.route('/api/onboarding', onboarding)

export default app
