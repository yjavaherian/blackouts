<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { useToast } from '$lib/composables/useToast';

	import AppHeader from '$lib/components/AppHeader.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LocationCard from '$lib/components/LocationCard.svelte';
	import AddLocationDialog from '$lib/components/AddLocationDialog.svelte';
	import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
	import AuthForm from '$lib/components/AuthForm.svelte';

	export let data: PageData;
	export let form: ActionData;

	let dialogOpen = false;

	// Handle toast notifications
	$: useToast(form);

	function openDialog() {
		dialogOpen = true;
	}

	function closeDialog() {
		dialogOpen = false;
	}
</script>

<svelte:head>
	<title>برنامه خاموشی برق</title>
</svelte:head>

<div dir="rtl" class="min-h-screen bg-gray-50 font-sans text-gray-900">
	<div class="container mx-auto px-3 py-4 sm:p-6 lg:p-8">
		{#if data.authenticated}
			<AppHeader lastRefresh={data.lastRefresh} />

			<main class="w-full">
				{#if data.locations.length === 0}
					<EmptyState onAddLocation={openDialog} />
				{:else}
					{#each data.locations as location (location.id)}
						<LocationCard {location} />
					{/each}
				{/if}
			</main>
		{:else}
			<AuthForm {form} />
		{/if}
	</div>
</div>

{#if data.authenticated}
	<FloatingActionButton onClick={openDialog} />
	<AddLocationDialog isOpen={dialogOpen} onClose={closeDialog} {form} />
{/if}
