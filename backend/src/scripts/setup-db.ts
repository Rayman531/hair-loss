import 'dotenv/config';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sql } from '../db/connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');

    // Run schema migration
    console.log('📝 Running schema migration...');
    const schemaSQL = await readFile(
      join(__dirname, '../../migrations/001_onboarding_schema.sql'),
      'utf-8'
    );

    // Split SQL statements and execute them individually
    const schemaStatements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of schemaStatements) {
      await sql.unsafe(statement);
    }
    console.log('✅ Schema migration completed\n');

    // Run seed migration
    console.log('🌱 Seeding onboarding questions...');
    const seedSQL = await readFile(
      join(__dirname, '../../migrations/002_seed_onboarding_questions.sql'),
      'utf-8'
    );

    // Split SQL statements and execute them individually
    const seedStatements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of seedStatements) {
      await sql.unsafe(statement);
    }
    console.log('✅ Seed data inserted\n');

    // Verify the data
    try {
      const questionCount = await sql`SELECT COUNT(*) as count FROM onboarding_questions`;
      const optionCount = await sql`SELECT COUNT(*) as count FROM onboarding_options`;

      console.log('📊 Database status:');
      console.log(`   Questions: ${questionCount[0].count}`);
      console.log(`   Options: ${optionCount[0].count}`);
      console.log('\n✨ Database setup completed successfully!');
    } catch (verifyError) {
      console.log('\n⚠️  Warning: Could not verify data (tables may not exist yet)');
      console.log('   You may need to run the migrations manually in your Neon console');
      console.log(`   Error: ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
