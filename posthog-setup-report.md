# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the hair-loss treatment tracking backend. A new `posthog-node` client helper was added and 8 route files were instrumented to capture 12 distinct business events covering the full user lifecycle — from first onboarding through daily treatment logging, progress photo uploads, and account deletion.

## Changes made

| File | Change |
|------|--------|
| `backend/src/lib/posthog.ts` | **New file** — `createPostHogClient(env)` factory for per-request serverless PostHog clients |
| `backend/src/index.ts` | Added `POSTHOG_API_KEY` / `POSTHOG_HOST` to `Env` type; `captureException` in global error handler |
| `backend/src/routes/onboarding.ts` | `onboarding_completed` + `identify` on onboarding submit |
| `backend/src/routes/tracker/routine.ts` | `routine_created` on POST |
| `backend/src/routes/tracker/treatments.ts` | `treatment_added`, `treatment_updated`, `treatment_deleted` |
| `backend/src/routes/tracker/treatment-logs.ts` | `treatment_logged` on POST (upsert) |
| `backend/src/routes/progress.ts` | `progress_photo_uploaded`, `progress_photo_deleted` |
| `backend/src/routes/feedback.ts` | `feedback_submitted` on POST |
| `backend/src/routes/notifications.ts` | `push_token_registered`, `notification_preferences_updated` |
| `backend/src/routes/account.ts` | `account_deleted` (churn event) |

## Events tracked

| Event | Description | File |
|-------|-------------|------|
| `onboarding_completed` | User submits all 10 onboarding answers | `routes/onboarding.ts` |
| `routine_created` | User creates their treatment routine for the first time | `routes/tracker/routine.ts` |
| `treatment_added` | User adds a new treatment to their routine | `routes/tracker/treatments.ts` |
| `treatment_updated` | User updates a treatment's name or schedule | `routes/tracker/treatments.ts` |
| `treatment_deleted` | User removes a treatment from their routine | `routes/tracker/treatments.ts` |
| `treatment_logged` | User marks a treatment as completed or uncompleted for a given day | `routes/tracker/treatment-logs.ts` |
| `progress_photo_uploaded` | User uploads a 4-angle scalp photo session | `routes/progress.ts` |
| `progress_photo_deleted` | User deletes a progress photo session | `routes/progress.ts` |
| `feedback_submitted` | User submits in-app feedback | `routes/feedback.ts` |
| `notification_preferences_updated` | User enables/disables or reschedules push reminders | `routes/notifications.ts` |
| `push_token_registered` | User registers a new push notification device | `routes/notifications.ts` |
| `account_deleted` | User permanently deletes their account — churn event | `routes/account.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/368437/dashboard/1429596
- **User Activation Funnel** (onboarding → routine → first treatment): https://us.posthog.com/project/368437/insights/2KkU2KD5
- **Daily Active Users (Treatment Logging)**: https://us.posthog.com/project/368437/insights/17BZxg4W
- **Progress Photo Uploads**: https://us.posthog.com/project/368437/insights/DV5dVfvt
- **Account Deletions (Churn)**: https://us.posthog.com/project/368437/insights/6hpuv679
- **New User Setup Steps**: https://us.posthog.com/project/368437/insights/5pVKD6yC

> **Note:** Add `POSTHOG_API_KEY` and `POSTHOG_HOST` as Cloudflare Workers secrets via `wrangler secret put POSTHOG_API_KEY` and `wrangler secret put POSTHOG_HOST` before deploying. The values are already in `backend/.env` for local development.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
