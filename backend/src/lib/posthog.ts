import { PostHog } from 'posthog-node'

export type PostHogEnv = {
  POSTHOG_API_KEY: string
  POSTHOG_HOST: string
}

// Creates a per-request PostHog client suitable for Cloudflare Workers (serverless).
// flushAt:1 and flushInterval:0 ensure events are sent immediately.
export function createPostHogClient(env: PostHogEnv): PostHog {
  return new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  })
}
