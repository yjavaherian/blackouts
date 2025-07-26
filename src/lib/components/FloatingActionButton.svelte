<script lang="ts">
	import { Plus } from 'lucide-svelte';

	export let onClick: () => void;
</script>

<button
	type="button"
	on:click={onClick}
	class="fixed bottom-6 left-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:ring-4 focus:ring-orange-300 focus:outline-none"
	aria-label="افزودن موقعیت جدید"
>
	<Plus class="h-8 w-8" />
</button>
