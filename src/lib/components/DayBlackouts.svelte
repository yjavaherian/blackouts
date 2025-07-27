<script lang="ts">
	import { toAmPm } from '$lib/date-utils';
	import { PartyPopper } from 'lucide-svelte';
	import type { CalendarDay } from '$lib/types';

	let { day }: { day: CalendarDay } = $props();
</script>

<div class="day-content">
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

<style>
	.day-content {
		width: 100%;
	}
</style>
