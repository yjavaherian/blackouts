<script lang="ts">
	import { Lightbulb, RefreshCw } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatLastRefresh } from '$lib/utils';

	export let lastRefresh: string | undefined;

	let refreshing = false;
</script>

<header class="mb-6 md:mb-8">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<Lightbulb class="h-7 w-7 text-yellow-400 md:h-8 md:w-8" />
			<h1 class="text-xl font-bold text-gray-800 md:text-2xl lg:text-3xl">برنامه خاموشی برق</h1>
		</div>

		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
			<p class="text-xs text-gray-500 sm:text-sm">
				آخرین بروزرسانی: {formatLastRefresh(lastRefresh)}
			</p>

			<form
				method="POST"
				action="?/refresh"
				use:enhance={() => {
					refreshing = true;
					return async ({ result }) => {
						await invalidateAll();
						refreshing = false;
					};
				}}
			>
				<button
					type="submit"
					disabled={refreshing}
					class="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4"
				>
					<RefreshCw class={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
					<span class="hidden sm:inline"
						>{refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی همه'}</span
					>
					<span class="sm:hidden">{refreshing ? 'بروزرسانی...' : 'بروزرسانی'}</span>
				</button>
			</form>
		</div>
	</div>
</header>
