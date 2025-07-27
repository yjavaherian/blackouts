import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from './session';
import { encryptToken, decryptToken } from './crypto';

const OTP_SEND_URL = process.env.OTP_SEND_URL || 'https://uiapi.saapa.ir/api/otp/sendCode';
const OTP_VERIFY_URL = process.env.OTP_VERIFY_URL || 'https://uiapi.saapa.ir/api/otp/verifyCode';

interface OtpSendResponse {
	TimeStamp: string;
	status: number;
	SessionKey: string;
	message: string;
	data: any;
	error: null | string;
}

interface OtpVerifyResponse {
	TimeStamp: string;
	status: number;
	SessionKey: string;
	message: string;
	data: {
		Token: string;
		Type: string;
	};
	error: null | string;
}

export async function sendOtpCode(mobile: string): Promise<{ success: boolean; message: string }> {
	try {
		const response = await fetch(OTP_SEND_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: 'application/json, text/plain, */*'
			},
			body: JSON.stringify({ mobile })
		});

		if (!response.ok) {
			return {
				success: false,
				message: `HTTP error: ${response.status} ${response.statusText}`
			};
		}

		const result: OtpSendResponse = await response.json();

		if (result.status !== 200) {
			return {
				success: false,
				message: result.message || result.error || 'Failed to send OTP'
			};
		}

		return {
			success: true,
			message: 'OTP code sent successfully'
		};
	} catch (error) {
		console.error('Error sending OTP:', error);
		return {
			success: false,
			message: 'Network error occurred'
		};
	}
}

export async function verifyOtpCode(
	mobile: string,
	code: string
): Promise<{ success: boolean; message: string; sessionId?: string }> {
	try {
		const response = await fetch(OTP_VERIFY_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: 'application/json, text/plain, */*'
			},
			body: JSON.stringify({
				mobile,
				code,
				request_source: 5,
				device_token: ''
			})
		});

		if (!response.ok) {
			return {
				success: false,
				message: `HTTP error: ${response.status} ${response.statusText}`
			};
		}

		const result: OtpVerifyResponse = await response.json();

		if (result.status !== 200) {
			return {
				success: false,
				message: result.message || result.error || 'Failed to verify OTP'
			};
		}

		// Find or create user
		let user = await db.query.users.findFirst({
			where: eq(users.mobile, mobile)
		});

		const now = new Date().toISOString();

		if (!user) {
			// Create new user
			const encryptedToken = await encryptToken(result.data.Token);
			const [newUser] = await db
				.insert(users)
				.values({
					mobile,
					authToken: encryptedToken,
					createdAt: now,
					lastLogin: now
				})
				.returning();
			user = newUser;
		} else {
			// Update existing user
			const encryptedToken = await encryptToken(result.data.Token);
			await db
				.update(users)
				.set({
					authToken: encryptedToken,
					lastLogin: now
				})
				.where(eq(users.id, user.id));
			user.authToken = encryptedToken;
			user.lastLogin = now;
		}

		// Create session
		const sessionId = await createSession(user.id);

		return {
			success: true,
			message: 'Authentication successful',
			sessionId
		};
	} catch (error) {
		console.error('Error verifying OTP:', error);
		return {
			success: false,
			message: 'Network error occurred'
		};
	}
}

export async function getAuthTokenForUser(userId: number): Promise<string | null> {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId)
		});
		if (!user?.authToken) return null;

		// Decrypt the token before returning
		return await decryptToken(user.authToken);
	} catch (error) {
		console.error('Error retrieving auth token:', error);
		return null;
	}
}
