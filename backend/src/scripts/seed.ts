import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { onboardingQuestions, onboardingOptions } from '../db/schema';

const questionsData = [
  {
    questionText: 'How do you currently feel about your hair?',
    questionOrder: 1,
    options: [
      'I feel good about it',
      'Some days it bothers me',
      'It\'s starting to bother me',
      'It\'s causing me real stress',
    ],
  },
  {
    questionText: 'What situations make you notice your hair the most?',
    questionOrder: 2,
    options: [
      'In photos',
      'Under harsh lighting',
      'After a haircut',
      'After the shower',
      'I try not to think about it',
    ],
  },
  {
    questionText: 'What worries you the most about hair loss?',
    questionOrder: 3,
    options: [
      'Losing more',
      'Not knowing what works',
      'Wasting Money',
      'Side effects',
      'Loss of confidence',
      'I\'m not sure',
    ],
  },
  {
    questionText: 'When did you first notice thinning or recession?',
    questionOrder: 4,
    options: [
      'Within the last 6 months',
      '6-12 months ago',
      '1-2 years',
      '2+ years',
    ],
  },
  {
    questionText: 'Where do you notice it most?',
    questionOrder: 5,
    options: [
      'Temples (front corners)',
      'Crown (Back/top)',
      'Overall thinning',
      'Not sure, something just feels off',
    ],
  },
  {
    questionText: 'Do men in your family have hair loss?',
    questionOrder: 6,
    options: [
      'Yes',
      'No',
      'Not sure',
    ],
  },
  {
    questionText: 'Would you consider proven medications? (finasteride minoxidil)',
    questionOrder: 7,
    options: [
      'Yes, I\'m open to it',
      'Maybe, but I have some concerns',
      'Prefer to avoid medication for now',
    ],
  },
  {
    questionText: 'Would you consider microneedling?',
    questionOrder: 8,
    options: [
      'Sure',
      'Maybe',
      'No thanks',
    ],
  },
  {
    questionText: 'How consistent are you with habits?',
    questionOrder: 9,
    options: [
      'Very consistent',
      'Pretty good',
      'I\'m working on it',
      'I need help staying consistent',
    ],
  },
  {
    questionText: 'What\'s your hair goal?',
    questionOrder: 10,
    options: [
      'Maintain what I have',
      'Regrow what I\'ve lost',
      'Slow things down',
    ],
  },
];

async function seed() {
  const client = postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
  });
  const db = drizzle(client);

  try {
    console.log('🌱 Seeding database...\n');

    for (const questionData of questionsData) {
      console.log(`Seeding: "${questionData.questionText}"`);

      // Insert question
      const [question] = await db
        .insert(onboardingQuestions)
        .values({
          questionText: questionData.questionText,
          questionOrder: questionData.questionOrder,
        })
        .returning();

      // Insert options for this question
      for (let i = 0; i < questionData.options.length; i++) {
        await db.insert(onboardingOptions).values({
          questionId: question.id,
          optionText: questionData.options[i],
          optionOrder: i + 1,
        });
      }

      console.log(`  ✓ Added ${questionData.options.length} options`);
    }

    // Verify
    const questionCount = await db
      .select()
      .from(onboardingQuestions);

    const optionCount = await db
      .select()
      .from(onboardingOptions);

    console.log('\n📊 Database seeded:');
    console.log(`   Questions: ${questionCount.length}`);
    console.log(`   Options: ${optionCount.length}`);
    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
