<script lang="ts">
	import CalendarDay from './CalendarDay.svelte';
	import { getWeekDates, groupBlackoutsByDate, PERSIAN_WEEKDAYS } from '$lib/utils';
	import type { Location } from '$lib/types';

	export let location: Location;

	$: weekDates = getWeekDates();
	$: blackoutsByDate = groupBlackoutsByDate(location.blackouts);
	$: daysWithBlackouts = weekDates.map((day) => ({
		...day,
		blackouts: blackoutsByDate[day.date] || []
	}));
</script>

<div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
	<!-- Calendar Grid Header -->
	<div class="grid grid-cols-7 border-b border-gray-200">
		{#each PERSIAN_WEEKDAYS as dayName, dayIndex}
			<div
				class="border-l border-gray-200 bg-gray-50 p-3 text-center font-semibold text-gray-700 last:border-l-0"
			>
				{dayName}
				<div class="mt-1 text-xs text-gray-500">
					{daysWithBlackouts[dayIndex]?.jalaliDate || ''}
				</div>
			</div>
		{/each}
	</div>

	<!-- Calendar Days Content -->
	<div class="grid min-h-[200px] grid-cols-7">
		{#each daysWithBlackouts as day}
			<CalendarDay {day} />
		{/each}
	</div>
</div>
