import { getJalaliDateString, PERSIAN_WEEKDAYS } from './date-utils';
import type { CalendarDay, Blackout } from './types';

/**
 * Gets the current week's dates starting from Saturday (Persian week start)
 * Generates dates in chronological order for clarity
 */
export function getWeekDates(): CalendarDay[] {
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

	// Calculate offset to get to Saturday (start of Persian week)
	// Saturday = 6, Sunday = 0, Monday = 1, etc.
	const daysFromSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;

	const weekDates: CalendarDay[] = [];

	// Generate all 7 days starting from Saturday
	for (let i = 0; i < 7; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() - daysFromSaturday + i);

		const dateString = date.toISOString().split('T')[0];
		const jalaliDate = getJalaliDateString(dateString);
		const [year, month, day] = jalaliDate.split('/');

		weekDates.push({
			date: dateString,
			isToday: dateString === today.toISOString().split('T')[0],
			blackouts: [], // Will be populated by the component
			jalaliDate: `${day}/${month}`
		});
	}

	return weekDates;
}

/**
 * Groups blackouts by their outage date
 */
export function groupBlackoutsByDate(blackouts: Blackout[]): Record<string, Blackout[]> {
	const grouped: Record<string, Blackout[]> = {};

	for (const blackout of blackouts) {
		if (!grouped[blackout.outageDate]) {
			grouped[blackout.outageDate] = [];
		}
		grouped[blackout.outageDate].push(blackout);
	}

	return grouped;
}

/**
 * Validates Bill ID format (should be 13 digits)
 */
export function validateBillId(billId: string): boolean {
	return Boolean(billId && billId.length === 13 && /^\d{13}$/.test(billId));
}

/**
 * Formats last refresh date to Persian locale
 */
export function formatLastRefresh(isoString: string | null | undefined): string {
	if (!isoString) return 'هرگز';

	const date = new Date(isoString);
	return new Intl.DateTimeFormat('fa-IR', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
}

// Re-export PERSIAN_WEEKDAYS for convenience
export { PERSIAN_WEEKDAYS };
