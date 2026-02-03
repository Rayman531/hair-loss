# Backend Setup Guide

## Database Setup

### Option 1: Automated Script (Recommended)
Run the setup script which will create tables and seed data:
```bash
npm run setup-db
```

### Option 2: Manual Setup via Neon Console

If the automated script has issues, you can manually run the SQL migrations:

1. Go to your [Neon Console](https://console.neon.tech/)
2. Open the SQL Editor for your database
3. Run the schema migration:

```sql
-- Copy and paste contents of: migrations/001_onboarding_schema.sql
```

4. Then run the seed data:

```sql
-- Copy and paste contents of: migrations/002_seed_onboarding_questions.sql
```

## Running the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:8787`

## API Endpoints

### GET /api/onboarding/questions
Fetch all onboarding questions with their options.

**Example:**
```bash
curl http://localhost:8787/api/onboarding/questions
```

### POST /api/onboarding/responses
Submit user responses to onboarding questions.

**Example:**
```bash
curl -X POST http://localhost:8787/api/onboarding/responses \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "responses": [
      {"questionId": 1, "optionId": 3},
      {"questionId": 2, "optionId": 8},
      {"questionId": 3, "optionId": 14},
      {"questionId": 4, "optionId": 19},
      {"questionId": 5, "optionId": 23},
      {"questionId": 6, "optionId": 27},
      {"questionId": 7, "optionId": 30},
      {"questionId": 8, "optionId": 34},
      {"questionId": 9, "optionId": 38},
      {"questionId": 10, "optionId": 42}
    ]
  }'
```

## Environment Variables

Make sure your `.env` file contains:
```
DATABASE_URL=your_neon_database_url_here
```

## Deployment

```bash
npm run deploy
```
