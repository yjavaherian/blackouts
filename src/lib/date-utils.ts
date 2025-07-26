import jalaali from 'jalaali-js';

const PERSIAN_WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

export function toGregorian(jalaliDate: string): string {
	// input format is YYYY/MM/DD
	const [y, m, d] = jalaliDate.split('/').map(Number);
	const g = jalaali.toGregorian(y, m, d);
	// pad with zero
	const gMonth = g.gm < 10 ? `0${g.gm}` : g.gm;
	const gDay = g.gd < 10 ? `0${g.gd}` : g.gd;
	return `${g.gy}-${gMonth}-${gDay}`;
}

function getTodayJalali() {
	const today = new Date();
	return jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

export function getApiDateRange(): { fromDate: string; toDate: string } {
	const today = getTodayJalali();
	const fromDate = `${today.jy}/${today.jm}/${today.jd}`;

	// Add 7 days to today
	const futureDate = new Date();
	futureDate.setDate(futureDate.getDate() + 7);
	const toDateJalali = jalaali.toJalaali(
		futureDate.getFullYear(),
		futureDate.getMonth() + 1,
		futureDate.getDate()
	);
	const toDate = `${toDateJalali.jy}/${toDateJalali.jm}/${toDateJalali.jd}`;

	return { fromDate, toDate };
}

function getStartOfDay(date: Date): Date {
	const newDate = new Date(date);
	newDate.setHours(0, 0, 0, 0);
	return newDate;
}

export function toRelativeDate(gregorianDate: string): string {
	const today = getStartOfDay(new Date());
	const targetDay = getStartOfDay(new Date(gregorianDate));
	const diff = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	if (diff === 0) {
		return 'امروز';
	}
	if (diff === 1) {
		return 'فردا';
	}

	const targetJalali = jalaali.toJalaali(
		targetDay.getFullYear(),
		targetDay.getMonth() + 1,
		targetDay.getDate()
	);

	// For future dates, show the weekday name
	if (diff > 1) {
		const weekday = PERSIAN_WEEKDAYS[targetDay.getDay()];
		return weekday;
	}

	// This case should not be reached for future dates, but keeping for completeness
	const weekday = PERSIAN_WEEKDAYS[targetDay.getDay()];
	return `${weekday}، ${targetJalali.jy}/${targetJalali.jm}/${targetJalali.jd}`;
}

export function toAmPm(time: string): string {
	// time is in "HH:mm:ss" format
	const [h, m] = time.split(':');
	let hour = parseInt(h, 10);
	const minute = parseInt(m, 10);
	const period = hour >= 12 ? 'ب.ظ' : 'ق.ظ';
	hour = hour % 12;
	hour = hour ? hour : 12; // the hour '0' should be '12'
	const minuteStr = minute < 10 ? `0${minute}` : minute;
	return `${hour}:${minuteStr} ${period}`;
}

export function getJalaliDateString(gregorianDate: string): string {
	const date = new Date(gregorianDate);
	const j = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
	return `${j.jy}/${j.jm}/${j.jd}`;
}
