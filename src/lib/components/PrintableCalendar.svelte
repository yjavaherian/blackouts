<script lang="ts">
	import { getWeekDates, groupBlackoutsByDate, PERSIAN_WEEKDAYS } from '$lib/utils';
	import { toAmPm } from '$lib/date-utils';
	import type { Location } from '$lib/types';

	let { location }: { location: Location } = $props();

	const weekDates = getWeekDates();
	const blackoutsByDate = groupBlackoutsByDate(location.blackouts);
	const daysWithBlackouts = weekDates.map((day) => ({
		...day,
		blackouts: blackoutsByDate[day.date] || []
	}));
</script>

<svelte:head>
	<style>
		@media print {
			@page {
				size: A5 landscape;
				margin: 6mm;
			}
			body {
				padding: 0 !important;
				font-size: 10px !important;
			}
		}
	</style>
</svelte:head>

<div class="print-container">
	<div class="header">
		<h1 class="title">تقویم قطعی برق {location.name}</h1>
	</div>

	<div class="calendar">
		<!-- Calendar Header -->
		{#each PERSIAN_WEEKDAYS as dayName, dayIndex}
			<div class="day-header">
				<div class="day-name">{dayName}</div>
				<div class="day-date">{daysWithBlackouts[dayIndex]?.jalaliDate || ''}</div>
			</div>
		{/each}

		<!-- Calendar Days -->
		{#each daysWithBlackouts as day}
			<div class="day-cell">
				{#if day.blackouts.length === 0}
					<div class="no-blackout">بدون خاموشی</div>
				{:else}
					{#each day.blackouts as blackout}
						<div class="blackout-item">
							{toAmPm(blackout.startTime)} -> {toAmPm(blackout.endTime)}
						</div>
					{/each}
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 15mm;
		font-family: 'Vazir UI', sans-serif;
		direction: rtl;
		font-size: 12px;
		line-height: 1.4;
	}

	@font-face {
		font-family: 'Vazir UI';
		src: url('/vazir-ui.woff') format('woff');
	}

	.print-container {
		width: 100%;
	}

	.header {
		text-align: center;
		padding-bottom: 15px;
	}

	.title {
		font-size: 24px;
		font-weight: bold;
		margin: 0;
	}

	.calendar {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		border: 2px solid #000;
	}

	.day-header {
		background: #e0e0e0;
		border-right: 1px solid #000;
		border-bottom: 1px solid #000;
		padding: 8px 4px;
		text-align: center;
		font-weight: bold;
		font-size: 11px;
	}

	.day-header:last-child {
		border-right: none;
	}

	.day-name {
		margin-bottom: 4px;
	}

	.day-date {
		font-size: 9px;
		color: #666;
	}

	.day-cell {
		border-right: 1px solid #666;
		border-bottom: 1px solid #666;
		padding: 6px 4px;
		min-height: 50px;
		font-size: 9px;
	}

	.day-cell:nth-child(7n) {
		border-right: none;
	}

	.no-blackout {
		border: 1px solid #666;
		border-radius: 3px;
		padding: 4px;
		text-align: center;
		background: #f8f8f8;
		font-weight: 500;
	}

	.blackout-item {
		border: 1px solid #000;
		border-radius: 3px;
		padding: 4px;
		margin: 2px 0;
		text-align: center;
		background: #e8e8e8;
		font-weight: 600;
	}

	@media print {
		.print-container {
			padding: 0;
			font-size: 10px;
		}
	}
</style>
