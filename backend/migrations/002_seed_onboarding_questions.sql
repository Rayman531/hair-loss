-- Seed onboarding questions
INSERT INTO onboarding_questions (question_text, question_order) VALUES
('How do you currently feel about your hair?', 1),
('What situations make you notice your hair the most?', 2),
('What worries you the most about hair loss?', 3),
('When did you first notice thinning or recession?', 4),
('Where do you notice it most?', 5),
('Do men in your family have hair loss?', 6),
('Would you consider proven medications? (finasteride minoxidil)', 7),
('Would you consider microneedling?', 8),
('How consistent are you with habits?', 9),
('What''s your hair goal?', 10)
ON CONFLICT (question_order) DO NOTHING;

-- Seed options for Question 1: How do you currently feel about your hair?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(1, 'I feel good about it', 1),
(1, 'Some days it bothers me', 2),
(1, 'It''s starting to bother me', 3),
(1, 'It''s causing me real stress', 4);

-- Seed options for Question 2: What situations make you notice your hair the most?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(2, 'In photos', 1),
(2, 'Under harsh lighting', 2),
(2, 'After a haircut', 3),
(2, 'After the shower', 4),
(2, 'I try not to think about it', 5);

-- Seed options for Question 3: What worries you the most about hair loss?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(3, 'Losing more', 1),
(3, 'Not knowing what works', 2),
(3, 'Wasting Money', 3),
(3, 'Side effects', 4),
(3, 'Loss of confidence', 5),
(3, 'I''m not sure', 6);

-- Seed options for Question 4: When did you first notice thinning or recession?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(4, 'Within the last 6 months', 1),
(4, '6-12 months ago', 2),
(4, '1-2 years', 3),
(4, '2+ years', 4);

-- Seed options for Question 5: Where do you notice it most?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(5, 'Temples (front corners)', 1),
(5, 'Crown (Back/top)', 2),
(5, 'Overall thinning', 3),
(5, 'Not sure, something just feels off', 4);

-- Seed options for Question 6: Do men in your family have hair loss?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(6, 'Yes', 1),
(6, 'No', 2),
(6, 'Not sure', 3);

-- Seed options for Question 7: Would you consider proven medications?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(7, 'Yes, I''m open to it', 1),
(7, 'Maybe, but I have some concerns', 2),
(7, 'Prefer to avoid medication for now', 3);

-- Seed options for Question 8: Would you consider microneedling?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(8, 'Sure', 1),
(8, 'Maybe', 2),
(8, 'No thanks', 3);

-- Seed options for Question 9: How consistent are you with habits?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(9, 'Very consistent', 1),
(9, 'Pretty good', 2),
(9, 'I''m working on it', 3),
(9, 'I need help staying consistent', 4);

-- Seed options for Question 10: What's your hair goal?
INSERT INTO onboarding_options (question_id, option_text, option_order) VALUES
(10, 'Maintain what I have', 1),
(10, 'Regrow what I''ve lost', 2),
(10, 'Slow things down', 3);
