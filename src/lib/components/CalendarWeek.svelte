<script lang="ts">
	import CalendarDay from './CalendarDay.svelte';
	import DayBlackouts from './DayBlackouts.svelte';
	import { getWeekDates, groupBlackoutsByDate, PERSIAN_WEEKDAYS } from '$lib/utils';
	import type { Location } from '$lib/types';

	let { location }: { location: Location } = $props();

	// P-4: Convert to const as it doesn't depend on props, use $derived for blackoutsByDate
	const weekDates = getWeekDates();
	let blackoutsByDate = $derived(groupBlackoutsByDate(location.blackouts));
	let daysWithBlackouts = $derived(
		weekDates.map((day) => ({
			...day,
			blackouts: blackoutsByDate[day.date] || []
		}))
	);
</script>

<div class="overflow-hidden rounded-b-xl border border-gray-300 bg-white">
	<!-- Unified responsive calendar structure -->
	<div class="calendar-container">
		<!-- Calendar Grid Header (hidden on mobile) -->
		<div class="calendar-header hidden border-b border-gray-300 md:grid md:grid-cols-7">
			{#each PERSIAN_WEEKDAYS as dayName, dayIndex}
				<div
					class="border-l border-gray-300 bg-gray-50 p-3 text-center font-semibold text-gray-700 last:border-l-0"
				>
					{dayName}
					<div class="mt-1 text-xs text-gray-500">
						{daysWithBlackouts[dayIndex]?.jalaliDate || ''}
					</div>
				</div>
			{/each}
		</div>

		<!-- Calendar Days Content -->
		<div class="calendar-days">
			{#each daysWithBlackouts as day, dayIndex}
				<!-- Desktop/Tablet: Grid cell -->
				<div class="day-container hidden md:block">
					<CalendarDay {day} />
				</div>

				<!-- Mobile: List item -->
				<div class="day-container border-b border-gray-100 last:border-b-0 md:hidden">
					<div class="px-4 py-3 {day.isToday ? 'bg-blue-50' : 'bg-gray-50'}">
						<div class="flex items-center justify-between">
							<h3 class="font-semibold text-gray-800">
								{PERSIAN_WEEKDAYS[dayIndex]}
								{#if day.isToday}
									<span
										class="mx-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
									>
										امروز
									</span>
								{/if}
							</h3>
							<span class="text-sm text-gray-500">{day.jalaliDate}</span>
						</div>
					</div>

					<div class="p-4">
						<DayBlackouts {day} />
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.calendar-days {
		/* Desktop/Tablet: Grid layout */
		@media (min-width: 768px) {
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			min-height: 200px;
		}
	}

	.day-container {
		/* Ensure consistent styling for both layouts */
		width: 100%;
	}
</style>
