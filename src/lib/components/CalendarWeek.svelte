<script lang="ts">
	import CalendarDay from './CalendarDay.svelte';
	import { getWeekDates, groupBlackoutsByDate, PERSIAN_WEEKDAYS } from '$lib/utils';
	import { toAmPm } from '$lib/date-utils';
	import { PartyPopper } from 'lucide-svelte';
	import type { Location } from '$lib/types';

	export let location: Location;

	$: weekDates = getWeekDates();
	$: blackoutsByDate = groupBlackoutsByDate(location.blackouts);
	$: daysWithBlackouts = weekDates.map((day) => ({
		...day,
		blackouts: blackoutsByDate[day.date] || []
	}));
</script>

<div class="overflow-hidden rounded-b-xl border border-gray-300 bg-white">
	<!-- Desktop/Tablet Grid View (hidden on mobile) -->
	<div class="hidden md:block">
		<!-- Calendar Grid Header -->
		<div class="grid grid-cols-7 border-b border-gray-300">
			{#each PERSIAN_WEEKDAYS.toReversed() as dayName, dayIndex}
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
		<div class="grid min-h-[200px] grid-cols-7">
			{#each daysWithBlackouts as day}
				<CalendarDay {day} />
			{/each}
		</div>
	</div>

	<!-- Mobile List View (visible only on mobile) -->
	<div class="md:hidden">
		{#each daysWithBlackouts.toReversed() as day, dayIndex}
			<div class="border-b border-gray-100 last:border-b-0">
				<div class=" px-4 py-3 {day.isToday ? 'bg-blue-50' : 'bg-gray-50'}">
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
					{#if day.blackouts.length === 0}
						<div class="flex items-center justify-center rounded-lg bg-green-50 p-4">
							<PartyPopper class="mx-2 h-5 w-5 text-green-600" />
							<p class="text-sm font-medium text-green-700">بدون خاموشی</p>
						</div>
					{:else}
						<div class="flex gap-2">
							{#each day.blackouts as blackout}
								<div
									class="w-fit rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-700"
								>
									{toAmPm(blackout.startTime)} - {toAmPm(blackout.endTime)}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
