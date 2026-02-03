import 'dotenv/config';
import postgres from 'postgres';

async function clearDatabase() {
  const sql = postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
  });

  try {
    console.log('🗑️  Clearing database...\n');

    // Drop tables in correct order (reverse of creation due to foreign keys)
    console.log('Dropping onboarding_responses table...');
    await sql`DROP TABLE IF EXISTS onboarding_responses CASCADE`;

    console.log('Dropping onboarding_options table...');
    await sql`DROP TABLE IF EXISTS onboarding_options CASCADE`;

    console.log('Dropping onboarding_questions table...');
    await sql`DROP TABLE IF EXISTS onboarding_questions CASCADE`;

    console.log('\n✅ Database cleared successfully!\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

clearDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
