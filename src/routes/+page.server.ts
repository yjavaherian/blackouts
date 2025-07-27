import { db } from '$lib/server/db';
import { locations, blackouts, meta } from '$lib/server/db/schema';
import { refreshAllBlackouts, refreshBlackoutsForLocation } from '$lib/server/api';
import { isAuthenticated, sendOtpCode, verifyOtpCode, clearAuthToken } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import { eq, gte } from 'drizzle-orm';
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

export const load: PageServerLoad = async () => {
	const authenticated = await isAuthenticated();

	if (!authenticated) {
		return {
			authenticated: false,
			locations: [],
			lastRefresh: null
		};
	}

	const today = getTodayGregorian();

	const lastRefreshRow = await db.query.meta.findFirst({ where: eq(meta.key, 'lastRefresh') });
	const lastRefresh = lastRefreshRow?.value ? new Date(lastRefreshRow.value) : null;

	if (!lastRefresh || new Date().getTime() - lastRefresh.getTime() > 24 * 60 * 60 * 1000) {
		await refreshAllBlackouts();
	}

	const allLocations = await db.query.locations.findMany({
		with: {
			blackouts: {
				where: gte(blackouts.outageDate, today),
				orderBy: (blackouts, { asc }) => [asc(blackouts.outageDate), asc(blackouts.startTime)]
			}
		}
	});

	const updatedLastRefresh = await db.query.meta.findFirst({
		where: eq(meta.key, 'lastRefresh')
	});

	return {
		authenticated: true,
		locations: allLocations,
		lastRefresh: updatedLastRefresh?.value
	};
};

export const actions: Actions = {
	sendOtp: async ({ request }) => {
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

		return {
			type: 'sendOtp',
			success: true,
			message: 'کد تایید ارسال شد'
		};
	},

	verifyOtp: async ({ request }) => {
		const data = await request.formData();
		const mobile = data.get('mobile') as string;
		const code = data.get('code') as string;

		console.log('Server received - mobile:', mobile, 'code:', code);

		if (!mobile || !code) {
			return fail(400, {
				type: 'verifyOtp',
				success: false,
				message: 'شماره موبایل و کد تایید الزامی است'
			});
		}

		const result = await verifyOtpCode(mobile, code);

		if (!result.success) {
			return fail(400, {
				type: 'verifyOtp',
				success: false,
				message: result.message
			});
		}

		return {
			type: 'verifyOtp',
			success: true,
			message: 'ورود با موفقیت انجام شد',
			toast: { type: 'success', message: 'ورود با موفقیت انجام شد' }
		};
	},

	addLocation: async ({ request }) => {
		const authenticated = await isAuthenticated();
		if (!authenticated) {
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
			const newLocation = await db.insert(locations).values({ name, billId }).returning();
			if (newLocation[0]) {
				await refreshBlackoutsForLocation(newLocation[0].id, newLocation[0].billId);
			}
		} catch (error) {
			// Likely a unique constraint violation on billId
			return fail(400, {
				type: 'addLocation',
				success: false,
				message: 'شناسه قبض قبلا ثبت شده است'
			});
		}

		return {
			type: 'addLocation',
			success: true,
			toast: { type: 'success', message: 'موقعیت با موفقیت اضافه شد' }
		};
	},

	removeLocation: async ({ request }) => {
		const authenticated = await isAuthenticated();
		if (!authenticated) {
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

		await db.delete(locations).where(eq(locations.id, Number(id)));

		return { success: true, toast: { type: 'success', message: 'موقعیت با موفقیت حذف شد' } };
	},

	refresh: async () => {
		const authenticated = await isAuthenticated();
		if (!authenticated) {
			return fail(401, {
				success: false,
				message: 'لطفا ابتدا وارد شوید'
			});
		}

		try {
			await refreshAllBlackouts();
			return { success: true, toast: { type: 'success', message: 'اطلاعات با موفقیت بروز شد' } };
		} catch (error) {
			return fail(500, {
				success: false,
				message: 'خطا در بروزرسانی اطلاعات',
				toast: { type: 'error', message: 'خطا در بروزرسانی اطلاعات' }
			});
		}
	},

	logout: async () => {
		await clearAuthToken();
		return {
			type: 'logout',
			success: true,
			toast: { type: 'success', message: 'با موفقیت خارج شدید' }
		};
	}
};
