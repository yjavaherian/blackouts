<script lang="ts">
	import { toRelativeDate, toAmPm, getJalaliDateString } from '$lib/date-utils';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { RefreshCw, Plus, Trash2, PartyPopper, Lightbulb } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;
	export let form: ActionData;
	let refreshing = false;
	let adding = false;
	let removing: number | null = null;

	$: {
		if (form?.toast) {
			toast[form.toast.type](form.toast.message);
		}
	}

	function formatLastRefresh(isoString: string | null | undefined) {
		if (!isoString) return 'هرگز';
		const date = new Date(isoString);
		return new Intl.DateTimeFormat('fa-IR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	}
</script>

<svelte:head>
	<title>برنامه قطعی برق</title>
</svelte:head>

<div dir="rtl" class="min-h-screen bg-gray-50 font-sans text-gray-900">
	<div class="container mx-auto p-4 sm:p-6 lg:p-8">
		<header class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<div class="flex items-center gap-3">
				<Lightbulb class="h-8 w-8 text-yellow-400" />
				<h1 class="text-2xl font-bold text-gray-800 sm:text-3xl">برنامه قطعی برق</h1>
			</div>
			<div class="flex items-baseline gap-3">
				<p class="text-xs text-gray-500 sm:text-sm">
					آخرین بروزرسانی: {formatLastRefresh(data.lastRefresh)}
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
						class="flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<RefreshCw class={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
						<span>{refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی همه'}</span>
					</button>
				</form>
			</div>
		</header>

		<main class="grid grid-cols-1 gap-10 lg:grid-cols-3">
			<aside class="lg:col-span-1">
				<div class="sticky top-8 rounded-lg border bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-xl font-semibold text-gray-800">افزودن موقعیت جدید</h2>
					<form
						method="POST"
						action="?/addLocation"
						use:enhance={({ form: formEl }) => {
							adding = true;
							return async ({ result }) => {
								await invalidateAll();
								adding = false;
								if (result.type === 'success') {
									formEl.reset();
								}
							};
						}}
						class="space-y-4"
					>
						<div>
							<label for="name" class="mb-1 block text-sm font-medium text-gray-700"
								>نام موقعیت</label
							>
							<input
								type="text"
								name="name"
								id="name"
								required
								class="block w-full rounded-md border-gray-300 bg-transparent px-3 py-2 text-sm placeholder-gray-400 transition-colors focus:border-gray-500 focus:ring-0 focus:outline-none"
								placeholder="مثال: خانه"
							/>
						</div>
						<div>
							<label for="billId" class="mb-1 block text-sm font-medium text-gray-700"
								>شناسه قبض</label
							>
							<input
								type="text"
								name="billId"
								id="billId"
								required
								class="block w-full rounded-md border-gray-300 bg-transparent px-3 py-2 text-sm placeholder-gray-400 transition-colors focus:border-gray-500 focus:ring-0 focus:outline-none"
								placeholder="یک کد ۱۳ رقمی"
							/>
						</div>
						<button
							type="submit"
							disabled={adding}
							class="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Plus class={`h-4 w-4 ${adding ? 'animate-spin' : ''}`} />
							<span>{adding ? 'در حال افزودن...' : 'افزودن'}</span>
						</button>
						{#if form?.success === false && form?.type === 'addLocation'}
							<p class="mt-2 text-sm text-red-600">{form.message}</p>
						{/if}
					</form>
				</div>
			</aside>

			<section class="space-y-6 lg:col-span-2">
				{#if data.locations.length === 0}
					<div
						class="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 text-center"
					>
						<p class="text-lg font-medium text-gray-600">هیچ موقعیتی یافت نشد.</p>
						<p class="mt-1 text-sm text-gray-500">
							برای شروع، یک موقعیت جدید از فرم کناری اضافه کنید.
						</p>
					</div>
				{:else}
					{#each data.locations as location (location.id)}
						<div class="rounded-lg border-r-4 border-orange-400 bg-white shadow-sm">
							<div class="flex items-center justify-between border-b p-4 sm:p-6">
								<div class="flex items-baseline gap-2">
									<h3 class="text-lg font-semibold text-gray-800">{location.name}</h3>
									<p class="font-mono text-xs text-gray-500">({location.billId})</p>
								</div>
								<form
									method="POST"
									action="?/removeLocation"
									use:enhance={() => {
										removing = location.id;
										return async ({ result }) => {
											await invalidateAll();
											removing = null;
										};
									}}
								>
									<input type="hidden" name="id" value={location.id} />
									<button
										type="submit"
										disabled={removing === location.id}
										class="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
										aria-label="حذف موقعیت"
									>
										<Trash2 class={`h-4 w-4 ${removing === location.id ? 'animate-spin' : ''}`} />
									</button>
								</form>
							</div>
							<div class="p-4 sm:p-6">
								{#if location.blackouts.length > 0}
									<ul class="space-y-4">
										{#each location.blackouts as blackout (blackout.id)}
											<li class="flex items-start gap-4">
												<div class="flex-1">
													<div class="flex items-baseline justify-between">
														<p class="font-semibold text-gray-800">
															{toRelativeDate(blackout.outageDate)}
															<span class="mr-1 text-xs font-normal text-gray-500"
																>({getJalaliDateString(blackout.outageDate)})</span
															>
														</p>
														<p class="text-sm text-gray-600">
															ساعت <strong class="font-semibold"
																>{toAmPm(blackout.startTime)}</strong
															>
															تا <strong class="font-semibold"
																>{toAmPm(blackout.endTime)}</strong
															>
														</p>
													</div>
												</div>
											</li>
										{/each}
									</ul>
								{:else}
									<div
										class="flex items-center gap-3 rounded-md bg-green-50 p-4 text-sm text-green-700"
									>
										<PartyPopper class="h-5 w-5 flex-shrink-0" />
										<span
											>خوش خبر! قطعی برق برنامه‌ریزی شده‌ای برای این موقعیت وجود
											ندارد.</span
										>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</section>
		</main>
	</div>
</div>