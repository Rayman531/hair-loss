import { PostHog } from 'posthog-node'

export type PostHogEnv = {
  POSTHOG_API_KEY: string
  POSTHOG_HOST: string
}

const noop = async () => {}
const noopSync = () => {}

// No-op PostHog client used when credentials are missing (e.g. local dev).
const noopClient = {
  capture: noopSync,
  identify: noopSync,
  captureException: noopSync,
  shutdown: noop,
} as unknown as PostHog

// Creates a per-request PostHog client suitable for Cloudflare Workers (serverless).
// Returns a no-op client when credentials are not configured so missing env vars
// never crash request handlers.
export function createPostHogClient(env: Partial<PostHogEnv>): PostHog {
  if (!env.POSTHOG_API_KEY || !env.POSTHOG_HOST) {
    return noopClient
  }
  return new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  })
}
