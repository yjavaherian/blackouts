// The user must create a .env file in the root of the project.
// It should contain the following line:
// DATABASE_URL=sqlite.db

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

const sqlite = new Database(DATABASE_URL);
export const db = drizzle(sqlite, { schema });
