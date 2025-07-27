<script lang="ts">
	import { Lightbulb, RefreshCw, LogOut } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { formatLastRefresh } from '$lib/utils';

	let { lastRefresh }: { lastRefresh: string | undefined } = $props();

	let refreshing = $state(false);
	let loggingOut = $state(false);
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

			<div class="flex gap-2">
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
						class="flex items-center justify-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
					>
						<RefreshCw class={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
						<span class="hidden sm:inline"
							>{refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی همه'}</span
						>
						<span class="sm:hidden">{refreshing ? 'بروزرسانی...' : 'بروزرسانی'}</span>
					</button>
				</form>

				<form
					method="POST"
					action="?/logout"
					use:enhance={() => {
						loggingOut = true;
						return async ({ result }) => {
							await invalidateAll();
							loggingOut = false;
						};
					}}
				>
					<button
						type="submit"
						disabled={loggingOut}
						class="flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
					>
						<LogOut class="h-4 w-4" />
						<span class="hidden sm:inline">{loggingOut ? 'در حال خروج...' : 'خروج'}</span>
					</button>
				</form>
			</div>
		</div>
	</div>
</header>
