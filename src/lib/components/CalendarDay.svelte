<script lang="ts">
	import { toAmPm } from '$lib/date-utils';
	import { PartyPopper } from 'lucide-svelte';
	import type { CalendarDay } from '$lib/types';

	export let day: CalendarDay;
</script>

<div class="border-l border-gray-200 p-2 last:border-l-0 md:p-3 {day.isToday ? 'bg-blue-50' : ''}">
	<!-- Blackouts for this day -->
	<div class="space-y-1 md:space-y-2">
		{#each day.blackouts as blackout}
			<div
				class="flex place-content-between rounded-lg border border-orange-200 bg-orange-50 p-2 text-sm text-orange-700"
			>
				<span>{toAmPm(blackout.startTime)}</span>
				<span>{toAmPm(blackout.endTime)}</span>
			</div>
		{/each}
	</div>

	<!-- No blackouts message -->
	{#if day.blackouts.length === 0}
		<div class="mt-1 text-center md:mt-2">
			<div class="inline-flex rounded-full bg-green-100 p-1 md:p-2">
				<PartyPopper class="h-3 w-3 text-green-600 md:h-4 md:w-4" />
			</div>
			<p class="mt-1 text-xs font-medium text-green-600">بدون خاموشی</p>
		</div>
	{/if}
</div>
