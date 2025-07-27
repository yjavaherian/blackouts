import { db } from '$lib/server/db';
import { locations, blackouts, meta } from '$lib/server/db/schema';
import { refreshAllBlackouts, refreshBlackoutsForLocation } from '$lib/server/api';
import { sendOtpCode, verifyOtpCode } from '$lib/server/auth';
import { deleteSession } from '$lib/server/session';
import {
	createOtpSession,
	getOtpSession,
	deleteOtpSession,
	incrementOtpAttempts
} from '$lib/server/otp-session';
import { fail, redirect } from '@sveltejs/kit';
import { eq, gte, and } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

function getTodayGregorian() {
	const today = new Date();
	const y = today.getFullYear();
	const m = today.getMonth() + 1;
	const d = today.getDate();
	const month = m < 10 ? `0${m}` : m;
	const day = d < 10 ? `0${d}` : d;
	return `${y}-${month}-${day}`;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return {
			authenticated: false,
			locations: [],
			lastRefresh: null
		};
	}

	const today = getTodayGregorian();

	// Check if user's data needs refresh (every 24 hours)
	const lastRefreshRow = await db.query.meta.findFirst({
		where: eq(meta.key, `lastRefresh_${user.id}`)
	});
	const lastRefresh = lastRefreshRow?.value ? new Date(lastRefreshRow.value) : null;

	// Trigger refresh in background without blocking the page load
	if (!lastRefresh || new Date().getTime() - lastRefresh.getTime() > 24 * 60 * 60 * 1000) {
		// Fire and forget - don't await this
		refreshAllBlackouts(user.id).catch((error) => {
			console.error('Background refresh failed for user', user.id, error);
		});
	}

	// Get user's locations with their blackouts
	const userLocations = await db.query.locations.findMany({
		where: eq(locations.userId, user.id),
		with: {
			blackouts: {
				where: gte(blackouts.outageDate, today),
				orderBy: (blackouts, { asc }) => [asc(blackouts.outageDate), asc(blackouts.startTime)]
			}
		}
	});

	const updatedLastRefresh = await db.query.meta.findFirst({
		where: eq(meta.key, `lastRefresh_${user.id}`)
	});

	return {
		authenticated: true,
		user: {
			mobile: user.mobile,
			createdAt: user.createdAt,
			lastLogin: user.lastLogin
		},
		locations: userLocations,
		lastRefresh: updatedLastRefresh?.value
	};
};

export const actions: Actions = {
	sendOtp: async ({ request, cookies }) => {
		const data = await request.formData();
		const mobile = data.get('mobile') as string;

		if (!mobile) {
			return fail(400, {
				type: 'sendOtp',
				success: false,
				message: 'شماره موبایل الزامی است'
			});
		}

		const result = await sendOtpCode(mobile);

		if (!result.success) {
			return fail(400, {
				type: 'sendOtp',
				success: false,
				message: result.message
			});
		}

		// Create secure OTP session and store mobile number securely
		const otpSessionId = createOtpSession(mobile);
		cookies.set('otp-session', otpSessionId, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 10 * 60 // 10 minutes
		});

		return {
			type: 'sendOtp',
			success: true,
			message: 'کد تایید ارسال شد'
		};
	},

	verifyOtp: async ({ request, cookies }) => {
		const data = await request.formData();
		const code = data.get('code') as string;

		// Get mobile number from secure OTP session instead of form data
		const otpSessionId = cookies.get('otp-session');
		if (!otpSessionId) {
			return fail(400, {
				type: 'verifyOtp',
				success: false,
				message: 'جلسه تایید منقضی شده است. مجدداً کد را درخواست کنید'
			});
		}

		const otpSession = getOtpSession(otpSessionId);
		if (!otpSession) {
			cookies.delete('otp-session', { path: '/' });
			return fail(400, {
				type: 'verifyOtp',
				success: false,
				message: 'جلسه تایید نامعتبر یا منقضی شده است'
			});
		}

		if (!code) {
			// Increment attempts for invalid code
			if (!incrementOtpAttempts(otpSessionId)) {
				cookies.delete('otp-session', { path: '/' });
				return fail(400, {
					type: 'verifyOtp',
					success: false,
					message: 'تعداد تلاش‌های نامعتبر زیاد است. مجدداً کد را درخواست کنید'
				});
			}
			return fail(400, {
				type: 'verifyOtp',
				success: false,
				message: 'کد تایید الزامی است'
			});
		}

		const result = await verifyOtpCode(otpSession.mobile, code);

		if (!result.success) {
			// Increment attempts for failed verification
			if (!incrementOtpAttempts(otpSessionId)) {
				cookies.delete('otp-session', { path: '/' });
				return fail(400, {
					type: 'verifyOtp',
					success: false,
					message: 'تعداد تلاش‌های نامعتبر زیاد است. مجدداً کد را درخواست کنید'
				});
			}
			return fail(400, {
				type: 'verifyOtp',
				success: false,
				message: result.message
			});
		}

		// Clean up OTP session
		deleteOtpSession(otpSessionId);
		cookies.delete('otp-session', { path: '/' });

		// Set session cookie
		if (result.sessionId) {
			const isProduction = process.env.NODE_ENV === 'production';
			cookies.set('auth-session', result.sessionId, {
				path: '/',
				httpOnly: true,
				secure: isProduction,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60 // 30 days
			});
		}

		throw redirect(302, '/');
	},

	addLocation: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, {
				type: 'addLocation',
				success: false,
				message: 'لطفا ابتدا وارد شوید'
			});
		}

		const data = await request.formData();
		const name = data.get('name') as string;
		const billId = data.get('billId') as string;

		if (!name || !billId) {
			return fail(400, {
				type: 'addLocation',
				success: false,
				message: 'نام و شناسه قبض الزامی است'
			});
		}

		try {
			const newLocation = await db
				.insert(locations)
				.values({
					name,
					billId,
					userId: user.id
				})
				.returning();

			if (newLocation[0]) {
				await refreshBlackoutsForLocation(newLocation[0].id, newLocation[0].billId, user.id);
			}
		} catch (error) {
			console.error('Error adding location:', error);

			// Check if it's a unique constraint violation
			if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
				return fail(400, {
					type: 'addLocation',
					success: false,
					message: 'موقعیتی با این شناسه قبض قبلاً ثبت شده است'
				});
			}

			return fail(400, {
				type: 'addLocation',
				success: false,
				message: 'خطا در اضافه کردن موقعیت'
			});
		}

		return {
			type: 'addLocation',
			success: true,
			toast: { type: 'success', message: 'موقعیت با موفقیت اضافه شد' }
		};
	},

	removeLocation: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, {
				success: false,
				message: 'لطفا ابتدا وارد شوید'
			});
		}

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { success: false, message: 'شناسه مکان نامعتبر است' });
		}

		// Make sure the location belongs to the user
		await db
			.delete(locations)
			.where(and(eq(locations.id, Number(id)), eq(locations.userId, user.id)));

		return { success: true, toast: { type: 'success', message: 'موقعیت با موفقیت حذف شد' } };
	},

	refresh: async ({ locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, {
				success: false,
				message: 'لطفا ابتدا وارد شوید'
			});
		}

		try {
			await refreshAllBlackouts(user.id);
			return { success: true, toast: { type: 'success', message: 'اطلاعات با موفقیت بروز شد' } };
		} catch (error) {
			return fail(500, {
				success: false,
				message: 'خطا در بروزرسانی اطلاعات',
				toast: { type: 'error', message: 'خطا در بروزرسانی اطلاعات' }
			});
		}
	},

	logout: async ({ cookies, locals }) => {
		if (locals.session) {
			await deleteSession(locals.session.id);
		}

		cookies.delete('auth-session', { path: '/' });

		throw redirect(302, '/');
	}
};
