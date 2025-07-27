import { getApiDateRange, toGregorian } from '$lib/date-utils';
import { blackouts, locations, meta } from './db/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { getAuthTokenForUser } from './auth';

const API_URL =
	process.env.BLACKOUTS_API_URL || 'https://uiapi2.saapa.ir/api/ebills/PlannedBlackoutsReport';

interface ApiBlackout {
	reg_date: string;
	registrar: string;
	reason_outage: string;
	outage_date: string; // "1404/04/19"
	outage_time: string; // "15:00:00"
	outage_start_time: string;
	outage_stop_time: string; // "17:00:00"
	is_planned: boolean;
	address: string;
	outage_address: string;
	city: number;
	outage_number: number;
	tracking_code: number;
}

interface ApiResponse {
	TimeStamp: string;
	status: number;
	SessionKey: string;
	message: string;
	data: ApiBlackout[];
	error: null | string;
}

async function fetchBlackoutsFromApi(
	userId: number,
	billId: string,
	fromDate: string,
	toDate: string
): Promise<{ success: boolean; data?: ApiBlackout[]; error?: string }> {
	try {
		const authToken = await getAuthTokenForUser(userId);
		if (!authToken) {
			return {
				success: false,
				error: 'No auth token available for user. Please authenticate first.'
			};
		}

		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Authorization: `Bearer ${authToken}`,
				Referer: 'https://bargheman.com/',
				Origin: 'https://bargheman.com'
			},
			body: JSON.stringify({
				bill_id: billId,
				from_date: fromDate,
				to_date: toDate
			})
		});

		if (!response.ok) {
			return {
				success: false,
				error: `API request failed with status ${response.status}: ${response.statusText}`
			};
		}

		const result: ApiResponse = await response.json();

		if (result.status !== 200 || !Array.isArray(result.data)) {
			return {
				success: false,
				error: result.message || result.error || 'API returned malformed data'
			};
		}

		return {
			success: true,
			data: result.data
		};
	} catch (error) {
		return {
			success: false,
			error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

export async function refreshBlackoutsForLocation(
	locationId: number,
	billId: string,
	userId: number
) {
	const { fromDate, toDate } = getApiDateRange();
	const apiResult = await fetchBlackoutsFromApi(userId, billId, fromDate, toDate);

	if (!apiResult.success) {
		console.error(`Failed to fetch blackouts for location ${locationId}:`, apiResult.error);
		return;
	}

	const apiData = apiResult.data || [];

	// Use database transaction to ensure atomicity
	await db.transaction(async (tx) => {
		// Clear old blackouts for this location
		await tx.delete(blackouts).where(eq(blackouts.locationId, locationId));

		if (apiData.length > 0) {
			const newBlackouts = apiData.map((b: ApiBlackout) => ({
				locationId: locationId,
				outageDate: toGregorian(b.outage_date),
				startTime: b.outage_time,
				endTime: b.outage_stop_time,
				reason: b.reason_outage,
				address: b.address
			}));

			await tx.insert(blackouts).values(newBlackouts);
		}
	});
}

export async function refreshAllBlackouts(userId: number) {
	const userLocations = await db.query.locations.findMany({
		where: eq(locations.userId, userId)
	});

	// Use Promise.all to run all API calls in parallel for better performance
	await Promise.all(
		userLocations.map((location) =>
			refreshBlackoutsForLocation(location.id, location.billId, userId)
		)
	);

	await db
		.insert(meta)
		.values({ key: `lastRefresh_${userId}`, value: new Date().toISOString() })
		.onConflictDoUpdate({
			target: meta.key,
			set: { value: new Date().toISOString() }
		});
}
