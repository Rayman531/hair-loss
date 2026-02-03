import { neon } from '@neondatabase/serverless';

// Create a database connection with the provided URL
export function createDbConnection(databaseUrl: string) {
  return neon(databaseUrl);
}

// Helper function to execute queries with error handling
export async function query<T = any>(
  sql: ReturnType<typeof neon>,
  queryText: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
