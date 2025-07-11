import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import * as schema from './schema';
import { execSync } from 'child_process';

if (!env.DATABASE_URL && !building) throw new Error('DATABASE_URL is not set');

// Run migrations automatically on startup
if (!building) {
	try {
		console.log('⏳ Running database migrations...');
		execSync('pnpm run db:push', { stdio: 'inherit' });
		console.log('✅ Database migrations completed.');
	} catch (e) {
		console.error('❌ Database migrations failed:', e);
		process.exit(1);
	}
}

const sqlite = new Database(env.DATABASE_URL ?? 'local.db');
export const db = drizzle(sqlite, { schema });