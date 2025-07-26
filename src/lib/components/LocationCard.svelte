<script lang="ts">
	import { Trash2, Printer } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CalendarWeek from './CalendarWeek.svelte';
	import PrintableCalendar from './PrintableCalendar.svelte';
	import type { Location } from '$lib/types';

	export let location: Location;

	let removing = false;
	let isPrintActive = false;

	function handlePrint() {
		isPrintActive = true;
		// Small delay to ensure the class is applied before printing
		setTimeout(() => {
			window.print();
			// Reset after printing
			setTimeout(() => {
				isPrintActive = false;
			}, 1000);
		}, 100);
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
				on:click={handlePrint}
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
					return async ({ result }) => {
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
	<!-- Hidden printable calendar -->
	<PrintableCalendar {location} {isPrintActive} />
</div>

<style>
	@media print {
		button {
			display: none !important;
		}
	}
</style>
