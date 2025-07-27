import { drizzle } from 'drizzle-orm/libsql';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import * as schema from './schema';

if (!env.DATABASE_URL && !building) throw new Error('DATABASE_URL is not set');
// if (!env.DATABASE_AUTH_TOKEN && !building) throw new Error('DATABASE_AUTH_TOKEN is not set');

export const db = drizzle({
	connection: {
		url: env.DATABASE_URL ?? 'file:local.db',
		authToken: env.DATABASE_AUTH_TOKEN
	},
	schema
});
