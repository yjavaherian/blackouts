import { db } from './db';
import { meta } from './db/schema';
import { eq } from 'drizzle-orm';

const OTP_SEND_URL = 'https://uiapi.saapa.ir/api/otp/sendCode';
const OTP_VERIFY_URL = 'https://uiapi.saapa.ir/api/otp/verifyCode';

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
): Promise<{ success: boolean; message: string }> {
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

		// Store the auth token in the database
		await db
			.insert(meta)
			.values({ key: 'auth_token', value: result.data.Token })
			.onConflictDoUpdate({ target: meta.key, set: { value: result.data.Token } });

		return {
			success: true,
			message: 'Authentication successful'
		};
	} catch (error) {
		console.error('Error verifying OTP:', error);
		return {
			success: false,
			message: 'Network error occurred'
		};
	}
}

export async function getAuthToken(): Promise<string | null> {
	try {
		const result = await db.select().from(meta).where(eq(meta.key, 'auth_token')).limit(1);
		return result.length > 0 ? result[0].value : null;
	} catch (error) {
		console.error('Error retrieving auth token:', error);
		return null;
	}
}

export async function isAuthenticated(): Promise<boolean> {
	const token = await getAuthToken();
	return token !== null;
}

export async function clearAuthToken(): Promise<void> {
	try {
		await db.delete(meta).where(eq(meta.key, 'auth_token'));
	} catch (error) {
		console.error('Error clearing auth token:', error);
	}
}
