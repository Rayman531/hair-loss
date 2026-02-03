-- Onboarding questions table
CREATE TABLE IF NOT EXISTS onboarding_questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Answer options for each question
CREATE TABLE IF NOT EXISTS onboarding_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES onboarding_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id, option_order)
);

-- User responses (logged for analytics/personalization)
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id SERIAL PRIMARY KEY,
  user_id UUID,  -- nullable if user hasn't signed up yet
  session_id TEXT,  -- temporary identifier before signup
  question_id INTEGER NOT NULL REFERENCES onboarding_questions(id),
  option_id INTEGER NOT NULL REFERENCES onboarding_options(id),
  answered_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_options_question_id ON onboarding_options(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON onboarding_responses(session_id);
