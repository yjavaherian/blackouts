import type { Handle } from '@sveltejs/kit';
import { validateSession, cleanupExpiredSessions } from '$lib/server/session';

const SESSION_COOKIE_NAME = 'auth-session';

// Keep track of last cleanup to avoid excessive cleanup calls
let lastCleanup = 0;
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

export const handle: Handle = async ({ event, resolve }) => {
	// Cleanup expired sessions periodically (every hour instead of randomly)
	const now = Date.now();
	if (now - lastCleanup > CLEANUP_INTERVAL) {
		lastCleanup = now;
		// Run cleanup in background without blocking the request
		cleanupExpiredSessions().catch(console.error);
	}

	// Get session ID from cookie
	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	if (sessionId) {
		const result = await validateSession(sessionId);
		if (result) {
			event.locals.user = result.user;
			event.locals.session = result.session;
		} else {
			// Invalid/expired session, remove cookie
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
			event.locals.user = null;
			event.locals.session = null;
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
