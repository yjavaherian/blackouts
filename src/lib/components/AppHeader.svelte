<script lang="ts">
	import { Lightbulb, RefreshCw } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatLastRefresh } from '$lib/utils';

	export let lastRefresh: string | undefined;

	let refreshing = false;
</script>

<header class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
	<div class="flex items-center gap-3">
		<Lightbulb class="h-8 w-8 text-yellow-400" />
		<h1 class="text-2xl font-bold text-gray-800 sm:text-3xl">برنامه خاموشی برق</h1>
	</div>

	<div class="flex items-baseline gap-3">
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
				class="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				<RefreshCw class={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
				<span>{refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی همه'}</span>
			</button>
		</form>
	</div>
</header>
