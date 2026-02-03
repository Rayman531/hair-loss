import 'dotenv/config';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  // Create postgres connection
  const sql = postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
  });

  try {
    console.log('🚀 Starting database setup...\n');

    // Run schema migration
    console.log('📝 Running schema migration...');
    const schemaSQL = await readFile(
      join(__dirname, '../../migrations/001_onboarding_schema.sql'),
      'utf-8'
    );
    await sql.unsafe(schemaSQL);
    console.log('✅ Schema migration completed\n');

    // Run seed migration
    console.log('🌱 Seeding onboarding questions...');
    const seedSQL = await readFile(
      join(__dirname, '../../migrations/002_seed_onboarding_questions.sql'),
      'utf-8'
    );
    await sql.unsafe(seedSQL);
    console.log('✅ Seed data inserted\n');

    // Verify the data
    const questionCount = await sql`SELECT COUNT(*) as count FROM onboarding_questions`;
    const optionCount = await sql`SELECT COUNT(*) as count FROM onboarding_options`;

    console.log('📊 Database status:');
    console.log(`   Questions: ${questionCount[0].count}`);
    console.log(`   Options: ${optionCount[0].count}`);
    console.log('\n✨ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
