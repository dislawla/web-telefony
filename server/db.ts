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

const databaseUrl = process.env.DATABASE_URL;

console.log('DATABASE URL:', databaseUrl);

if (!databaseUrl) {
  throw new Error('DATABASE URL must be set. Did you forget to provision a database?');
}

import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

let pool: pg.Pool;

async function createPool() {
  pool = new pg.Pool({
    connectionString: databaseUrl,
  });
  return pool;
}

export async function getPool() {
  if (!pool) {
    await createPool();
  }
  return pool;
}

// Создаем асинхронную функцию и вызываем ее немедленно
async function initializeDb() {
  return drizzle(await getPool(), { schema: schema });
}

export const db = await initializeDb();