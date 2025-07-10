<script lang="ts">
	import { toRelativeDate, toAmPm, getJalaliDateString } from '$lib/date-utils';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<svelte:head>
	<title>برنامه قطعی برق</title>
</svelte:head>

<div dir="rtl" class="container mx-auto min-h-screen bg-gray-50 p-4 font-sans">
	<header class="mb-8 flex items-center justify-between border-b pb-4">
		<h1 class="text-3xl font-bold text-gray-800">برنامه قطعی برق</h1>
		<form method="POST" action="?/refresh" use:enhance>
			<button
				type="submit"
				class="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-600"
			>
				🔄 بروزرسانی همه
			</button>
		</form>
	</header>

	<main class="grid grid-cols-1 gap-8 md:grid-cols-3">
		<div class="md:col-span-1">
			<aside class="sticky top-4 rounded-xl bg-white p-6 shadow-md">
				<h2 class="mb-4 text-2xl font-semibold text-gray-700">افزودن موقعیت جدید</h2>
				<form method="POST" action="?/addLocation" use:enhance class="space-y-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-600">نام موقعیت</label>
						<input
							type="text"
							name="name"
							id="name"
							required
							class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
							placeholder="مثال: خانه"
						/>
					</div>
					<div>
						<label for="billId" class="block text-sm font-medium text-gray-600">شناسه قبض</label>
						<input
							type="text"
							name="billId"
							id="billId"
							required
							class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
							placeholder="یک کد ۱۳ رقمی"
						/>
					</div>
					<button
						type="submit"
						class="w-full rounded-lg bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600"
					>
						افزودن
					</button>
					{#if form?.success === false}
						<p class="mt-2 text-sm text-red-500">{form.message}</p>
					{/if}
				</form>
			</aside>
		</div>

		<div class="md:col-span-2">
			<section class="space-y-6">
				{#each data.locations as location (location.id)}
					<div class="rounded-xl bg-white p-6 shadow-md">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-xl font-bold text-gray-800">{location.name}</h3>
							<form method="POST" action="?/removeLocation" use:enhance>
								<input type="hidden" name="id" value={location.id} />
								<button
									type="submit"
									class="font-semibold text-red-500 transition-colors hover:text-red-700"
								>
									حذف
								</button>
							</form>
						</div>
						<div class="space-y-3">
							{#if location.blackouts.length > 0}
								{#each location.blackouts as blackout (blackout.id)}
									<div class="border-r-4 border-orange-400 py-2 pr-4">
										<p class="font-semibold text-gray-700">
											{toRelativeDate(blackout.outageDate)} -
											<span class="text-sm text-gray-500"
												>({getJalaliDateString(blackout.outageDate)})</span
											>
										</p>
										<p class="text-lg">
											ساعت <strong class="text-blue-600">{toAmPm(blackout.startTime)}</strong>
											تا <strong class="text-blue-600">{toAmPm(blackout.endTime)}</strong>
										</p>
										<p class="text-sm text-gray-600">{blackout.reason}</p>
									</div>
								{/each}
							{:else}
								<p class="rounded-lg bg-green-50 p-3 text-green-600">
									🎉 خوش خبر! قطعی برق برنامه‌ریزی شده‌ای برای این موقعیت وجود ندارد.
								</p>
							{/if}
						</div>
					</div>
				{/each}
			</section>
		</div>
	</main>
</div>
