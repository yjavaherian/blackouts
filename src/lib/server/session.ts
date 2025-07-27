import { db } from './db';
import { sessions, users } from './db/schema';
import { eq, lt } from 'drizzle-orm';

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

function generateSessionId(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createSession(userId: number): Promise<string> {
	const sessionId = generateSessionId();
	const expiresAt = Date.now() + SESSION_DURATION;

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt
	});

	return sessionId;
}

export async function validateSession(
	sessionId: string
): Promise<{ user: any; session: any } | null> {
	if (!sessionId) return null;

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, sessionId),
		with: {
			user: {
				columns: {
					id: true,
					mobile: true,
					createdAt: true,
					lastLogin: true,
					lastRefresh: true
					// Exclude authToken from the query result
				}
			}
		}
	});

	if (!session) return null;

	if (session.expiresAt < Date.now()) {
		// Session expired, clean it up
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return null;
	}

	// If session expires in less than 15 days, extend it
	if (session.expiresAt - Date.now() < 15 * 24 * 60 * 60 * 1000) {
		const newExpiresAt = Date.now() + SESSION_DURATION;
		await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, sessionId));
		session.expiresAt = newExpiresAt;
	}

	return { user: session.user, session };
}

export async function deleteSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function cleanupExpiredSessions(): Promise<void> {
	await db.delete(sessions).where(lt(sessions.expiresAt, Date.now()));
}
