import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Ensure the database is provisioned.");
}

export default defineConfig({
  schema: './server/schema.ts',
  out: './migrations',
  driver: 'mysql2',
  dialect: 'mysql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
