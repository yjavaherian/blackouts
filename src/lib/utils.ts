import { getJalaliDateString } from './date-utils';
import type { CalendarDay, Blackout } from './types';

/**
 * Gets the current week's dates starting from Saturday (Persian week start)
 */
export function getWeekDates(): CalendarDay[] {
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

	// Calculate offset to get to Saturday (start of Persian week)
	const saturdayOffset = dayOfWeek === 6 ? 0 : dayOfWeek === 0 ? -1 : -(dayOfWeek + 1);

	const weekDates: CalendarDay[] = [];

	for (let i = 0; i < 7; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() + saturdayOffset + (6 - i));

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
 * Groups blackouts by date for easier lookup
 */
export function groupBlackoutsByDate(blackouts: Blackout[]): Record<string, Blackout[]> {
	return blackouts.reduce(
		(acc, blackout) => {
			if (!acc[blackout.outageDate]) {
				acc[blackout.outageDate] = [];
			}
			acc[blackout.outageDate].push(blackout);
			return acc;
		},
		{} as Record<string, Blackout[]>
	);
}

/**
 * Persian day names in correct order (Saturday first)
 */
export const PERSIAN_WEEKDAYS = [
	'شنبه',
	'یکشنبه',
	'دوشنبه',
	'سه‌شنبه',
	'چهارشنبه',
	'پنجشنبه',
	'جمعه'
];

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
