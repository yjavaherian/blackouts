<script lang="ts">
	import { Trash2, Printer } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CalendarWeek from './CalendarWeek.svelte';
	import { getWeekDates, groupBlackoutsByDate, PERSIAN_WEEKDAYS } from '$lib/utils';
	import { toAmPm } from '$lib/date-utils';
	import type { Location } from '$lib/types';

	let { location }: { location: Location } = $props();

	let removing = $state(false);

	function handlePrint() {
		// Generate the print content
		const weekDates = getWeekDates();
		const blackoutsByDate = groupBlackoutsByDate(location.blackouts);
		const daysWithBlackouts = weekDates.map((day) => ({
			...day,
			blackouts: blackoutsByDate[day.date] || []
		}));

		// Create the print window
		const printWindow = window.open('', '_blank', 'width=800,height=600');
		if (!printWindow) return;

		// Generate the HTML content
		const printHTML = `
			<!DOCTYPE html>
			<html lang="fa" dir="rtl">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>تقویم قطعی برق - ${location.name}</title>
				<style>
					@font-face {
						font-family: 'Vazir UI';
						src: url('/vazir-ui.woff') format('woff');
					}
					
					body {
						margin: 0;
						padding: 15mm;
						font-family: 'Vazir UI', sans-serif;
						direction: rtl;
						font-size: 12px;
						line-height: 1.4;
					}

					@media print {
						@page {
							size: A5 landscape;
							margin: 6mm;
						}
						body {
							padding: 0;
							font-size: 10px;
						}
					}

					.header {
						text-align: center;
						padding-bottom: 15px;
					}

					.title {
						font-size: 24px;
						font-weight: bold;
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
				</style>
			</head>
			<body>
				<div class="header">
					<h1 class="title">تقویم قطعی برق ${location.name}</h1>
					
				</div>

				<div class="calendar">
					${PERSIAN_WEEKDAYS.map(
						(dayName, dayIndex) => `
						<div class="day-header">
							<div class="day-name">${dayName}</div>
							<div class="day-date">${daysWithBlackouts[dayIndex]?.jalaliDate || ''}</div>
						</div>
					`
					).join('')}
					
					${daysWithBlackouts
						.map(
							(day) => `
						<div class="day-cell">
							${
								day.blackouts.length === 0
									? '<div class="no-blackout">بدون خاموشی</div>'
									: day.blackouts
											.map(
												(blackout) => `
									<div class="blackout-item">
										${toAmPm(blackout.startTime)} -> ${toAmPm(blackout.endTime)}
									</div>
								`
											)
											.join('')
							}
						</div>
					`
						)
						.join('')}
				</div>
			</body>
			</html>
		`;

		// Write the content and trigger print
		printWindow.document.write(printHTML);
		printWindow.document.close();

		// Wait for the content to load, then print and close
		printWindow.onload = () => {
			setTimeout(() => {
				printWindow.print();
				printWindow.onafterprint = () => {
					printWindow.close();
				};
			}, 500);
		};
	}
</script>

<div class="mb-6 rounded-xl shadow-sm md:mb-8">
	<!-- Location Header -->
	<div
		class="flex items-center justify-between rounded-t-xl border-t border-r border-l border-t-gray-300 border-r-gray-300 border-l-gray-300 bg-white p-3 text-gray-800 md:p-4"
	>
		<div class="flex items-center gap-2 md:gap-3">
			<h2 class="text-lg font-bold md:text-xl">{location.name}</h2>
			<span class="text-xs break-all text-gray-600">({location.billId})</span>
		</div>

		<div class="flex gap-2">
			<!-- Print Button -->
			<button
				type="button"
				onclick={handlePrint}
				class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
				aria-label="چاپ تقویم"
				title="چاپ تقویم این موقعیت"
			>
				<Printer class="h-4 w-4" />
			</button>

			<!-- Delete Button -->
			<form
				method="POST"
				action="?/removeLocation"
				use:enhance={() => {
					removing = true;
					return async () => {
						await invalidateAll();
						removing = false;
					};
				}}
			>
				<input type="hidden" name="id" value={location.id} />
				<button
					type="submit"
					disabled={removing}
					class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="حذف موقعیت"
				>
					<Trash2 class={`h-4 w-4 ${removing ? 'animate-spin' : ''}`} />
				</button>
			</form>
		</div>
	</div>

	<!-- Calendar -->
	<CalendarWeek {location} />
</div>
