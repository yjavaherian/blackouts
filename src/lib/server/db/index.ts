import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import * as schema from './schema';


if (!env.DATABASE_URL && !building) throw new Error('DATABASE_URL is not set');

const sqlite = new Database(env.DATABASE_URL ?? 'local.db');
export const db = drizzle(sqlite, { schema });