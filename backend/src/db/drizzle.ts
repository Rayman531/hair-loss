import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create a database connection with the provided URL
export function createDrizzleConnection(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// Type for the Drizzle database instance
export type DrizzleDB = ReturnType<typeof createDrizzleConnection>;
