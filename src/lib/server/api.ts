import { getApiDateRange, toGregorian } from '$lib/date-utils';
import { blackouts, locations } from './db/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

const API_URL = 'https://uiapi2.saapa.ir/api/ebills/PlannedBlackoutsReport';
const AUTH_TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IntcIlVzZXJJcFwiOm51bGwsXCJVc2VySWRcIjoxNjk2OTcxOCxcIlNlc3Npb25LZXlcIjpudWxsfSIsImV4cCI6MTc2ODAyMzI0OCwiaWF0IjoxNzUyMTI1NjQ4LCJuYmYiOjE3NTIxMjU2NDh9.EsT5oplpS-C0Skx6DDYNHMfxNbGuaSBE2hQpFJgFiOo';

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
	billId: string,
	fromDate: string,
	toDate: string
): Promise<ApiBlackout[]> {
	try {
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Authorization: `Bearer ${AUTH_TOKEN}`,
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
			console.error(`API request failed with status ${response.status}: ${response.statusText}`);
			return [];
		}

		const result: ApiResponse = await response.json();

		if (result.status !== 200 || !Array.isArray(result.data)) {
			console.error('API returned an error or malformed data:', result.message || result.error);
			return [];
		}

		return result.data;
	} catch (error) {
		console.error('Failed to fetch blackouts from API:', error);
		return [];
	}
}

export async function refreshBlackoutsForLocation(locationId: number, billId: string) {
	const { fromDate, toDate } = getApiDateRange();
	const apiData = await fetchBlackoutsFromApi(billId, fromDate, toDate);

	// Clear old blackouts for this location
	await db.delete(blackouts).where(eq(blackouts.locationId, locationId));

	if (apiData.length === 0) {
		return;
	}

	const newBlackouts = apiData.map((b) => ({
		locationId: locationId,
		outageDate: toGregorian(b.outage_date),
		startTime: b.outage_time,
		endTime: b.outage_stop_time,
		reason: b.reason_outage,
		address: b.address
	}));

	await db.insert(blackouts).values(newBlackouts);
}

export async function refreshAllBlackouts() {
	const allLocations = await db.select().from(locations);

	for (const location of allLocations) {
		await refreshBlackoutsForLocation(location.id, location.billId);
	}
}
