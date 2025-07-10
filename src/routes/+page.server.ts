import { db } from '$lib/server/db';
import { locations, blackouts } from '$lib/server/db/schema';
import { refreshAllBlackouts, refreshBlackoutsForLocation } from '$lib/server/api';
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
	const today = getTodayGregorian();

	const allLocations = await db.query.locations.findMany({
		with: {
			blackouts: {
				where: gte(blackouts.outageDate, today),
				orderBy: (blackouts, { asc }) => [asc(blackouts.outageDate), asc(blackouts.startTime)]
			}
		}
	});

	return {
		locations: allLocations
	};
};

export const actions: Actions = {
	addLocation: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const billId = data.get('billId') as string;

		if (!name || !billId) {
			return fail(400, { success: false, message: 'نام و شناسه قبض الزامی است' });
		}

		try {
			const newLocation = await db.insert(locations).values({ name, billId }).returning();
			if (newLocation[0]) {
				await refreshBlackoutsForLocation(newLocation[0].id, newLocation[0].billId);
			}
		} catch (error) {
			// Likely a unique constraint violation on billId
			return fail(400, { success: false, message: 'شناسه قبض قبلا ثبت شده است' });
		}

		return { success: true };
	},

	removeLocation: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) {
			return fail(400, { success: false, message: 'شناسه مکان نامعتبر است' });
		}

		await db.delete(locations).where(eq(locations.id, Number(id)));

		return { success: true };
	},

	refresh: async () => {
		await refreshAllBlackouts();
		return { success: true };
	}
};
