<script lang="ts">
	import { X, Plus } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { validateBillId } from '$lib/utils';
	import { focusTrap } from '$lib/actions/focus-trap';
	import type { ActionData } from '$lib/types';

	let {
		isOpen,
		onClose,
		form
	}: {
		isOpen: boolean;
		onClose: () => void;
		form: ActionData | null | undefined;
	} = $props();

	let adding = $state(false);
	let name = $state('');
	let billId = $state('');
	let nameInput: HTMLInputElement | undefined = $state();
	let billIdInput: HTMLInputElement | undefined = $state();

	// Handle successful form submission
	$effect(() => {
		if (form?.success === true && form?.type === 'addLocation') {
			// Reset form and close dialog on successful submission
			onClose();
			name = '';
			billId = '';
		}
	});

	function handleDialogClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			onClose();
		}
	}

	function handleBillIdInput(event: Event) {
		const input = event.target as HTMLInputElement;
		// Only allow digits and limit to 13 characters
		input.value = input.value.replace(/\D/g, '').slice(0, 13);
		billId = input.value;
	}

	let isFormValid = $derived(name.trim().length > 0 && validateBillId(billId));
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
		onclick={handleDialogClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
		tabindex="-1"
		style="animation: fadeIn 0.2s ease-out;"
	>
		<div
			class="w-full max-w-md transform rounded-xl border bg-white p-6 shadow-2xl transition-all"
			style="animation: slideUp 0.3s ease-out;"
			role="presentation"
			onclick={(e) => e.stopPropagation()}
			use:focusTrap
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 id="dialog-title" class="text-xl font-bold text-gray-800">افزودن موقعیت جدید</h2>
				<button
					type="button"
					onclick={onClose}
					class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					aria-label="بستن"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<form
				method="POST"
				action="?/addLocation"
				use:enhance={({ formElement }) => {
					adding = true;
					return async ({ result }) => {
						await invalidateAll();
						adding = false;
						if (result.type === 'success') {
							formElement.reset();
							name = '';
							billId = '';
							// Close dialog after successful submission
							onClose();
						}
					};
				}}
				class="space-y-5"
			>
				<div>
					<label for="dialog-name" class="mb-2 block text-sm font-semibold text-gray-700">
						نام موقعیت
					</label>
					<input
						bind:this={nameInput}
						bind:value={name}
						type="text"
						name="name"
						id="dialog-name"
						required
						class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
						placeholder="مثال: خانه، محل کار، ..."
					/>
				</div>

				<div>
					<label for="dialog-billId" class="mb-2 block text-sm font-semibold text-gray-700">
						شناسه قبض برق
					</label>
					<input
						bind:this={billIdInput}
						bind:value={billId}
						oninput={handleBillIdInput}
						type="text"
						name="billId"
						id="dialog-billId"
						required
						class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
						placeholder="یک کد ۱۳ رقمی"
						maxlength="13"
					/>
					{#if billId && !validateBillId(billId)}
						<p class="mt-1 text-xs text-red-600">شناسه قبض باید دقیقاً ۱۳ رقم باشد</p>
					{/if}
				</div>

				{#if form?.success === false && form?.type === 'addLocation'}
					<div class="rounded-lg border border-red-200 bg-red-50 p-3">
						<p class="text-sm font-medium text-red-700">{form.message}</p>
					</div>
				{/if}

				<div class="flex gap-3 pt-4">
					<button
						type="button"
						onclick={onClose}
						class="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:outline-none"
					>
						انصراف
					</button>

					<button
						type="submit"
						disabled={adding || !isFormValid}
						class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-bold text-white transition-all hover:from-orange-600 hover:to-orange-700 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
					>
						<Plus class={`h-4 w-4 ${adding ? 'animate-spin' : ''}`} />
						<span>{adding ? 'در حال افزودن...' : 'افزودن موقعیت'}</span>
					</button>
				</div>
			</form>
		</div>
	</div>

	<style>
		@keyframes fadeIn {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}

		@keyframes slideUp {
			from {
				opacity: 0;
				transform: translateY(20px) scale(0.95);
			}
			to {
				opacity: 1;
				transform: translateY(0) scale(1);
			}
		}
	</style>
{/if}
