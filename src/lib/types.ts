export interface Location {
	id: number;
	name: string;
	billId: string;
	blackouts: Blackout[];
}

export interface Blackout {
	id: number;
	locationId: number;
	outageDate: string;
	startTime: string;
	endTime: string;
	reason?: string | null;
	address?: string | null;
}

export interface Toast {
	type: string;
	message: string;
}

export interface ActionData {
	type?: string;
	success?: boolean;
	message?: string;
	toast?: Toast;
}

export interface PageData {
	locations: Location[];
	lastRefresh?: string;
}

export interface CalendarDay {
	date: string;
	isToday: boolean;
	blackouts: Blackout[];
	jalaliDate: string;
}
