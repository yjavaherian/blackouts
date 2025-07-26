<script lang="ts">
	import { Plus } from 'lucide-svelte';

	export let onClick: () => void;
</script>

<button
	type="button"
	on:click={onClick}
	class="fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:ring-4 focus:ring-orange-300 focus:outline-none md:bottom-6 md:left-6 md:h-16 md:w-16"
	aria-label="افزودن موقعیت جدید"
>
	<Plus class="h-7 w-7 md:h-8 md:w-8" />
</button>
