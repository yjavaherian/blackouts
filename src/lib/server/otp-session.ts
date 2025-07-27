// Temporary storage for OTP sessions
// In production, this should be stored in Redis or a similar cache
interface OtpSession {
	mobile: string;
	createdAt: number;
	attempts: number;
}

const otpSessions = new Map<string, OtpSession>();
const OTP_SESSION_DURATION = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function generateOtpSessionId(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createOtpSession(mobile: string): string {
	// Clean up expired sessions first
	cleanupExpiredOtpSessions();

	const sessionId = generateOtpSessionId();
	otpSessions.set(sessionId, {
		mobile,
		createdAt: Date.now(),
		attempts: 0
	});

	return sessionId;
}

export function getOtpSession(sessionId: string): OtpSession | null {
	cleanupExpiredOtpSessions();

	const session = otpSessions.get(sessionId);
	if (!session) return null;

	// Check if session is expired
	if (Date.now() - session.createdAt > OTP_SESSION_DURATION) {
		otpSessions.delete(sessionId);
		return null;
	}

	return session;
}

export function incrementOtpAttempts(sessionId: string): boolean {
	const session = otpSessions.get(sessionId);
	if (!session) return false;

	session.attempts++;

	// Remove session if max attempts reached
	if (session.attempts >= MAX_ATTEMPTS) {
		otpSessions.delete(sessionId);
		return false;
	}

	return true;
}

export function deleteOtpSession(sessionId: string): void {
	otpSessions.delete(sessionId);
}

function cleanupExpiredOtpSessions(): void {
	const now = Date.now();
	for (const [sessionId, session] of otpSessions.entries()) {
		if (now - session.createdAt > OTP_SESSION_DURATION) {
			otpSessions.delete(sessionId);
		}
	}
}
