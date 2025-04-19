import dotenv from 'dotenv';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

console.log('Loaded env file:', result.parsed);

console.log('Environment Variables:', process.env);

let pool: pg.Pool;
let db: ReturnType<typeof drizzle>;

async function createPool() {
  // Предпочитаем использовать DATABASE_URL, если он задан
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    pool = new pg.Pool({
      connectionString: databaseUrl,
    });
  } else {
    // Используем отдельные параметры подключения, если URL не задан
    pool = new pg.Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5432", 10),
    });
  }
  
  return pool;
}

export async function getPool() {
  if (!pool) {
    await createPool();
  }
  return pool;
}

export async function initializeDb() {
  if (!db) {
    db = drizzle(await getPool(), { schema: schema });
  }
  return db;
}

export { db };