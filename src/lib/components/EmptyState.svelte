<script lang="ts">
	import { Plus, Lightbulb } from 'lucide-svelte';

	let { onAddLocation }: { onAddLocation: () => void } = $props();
</script>

<div
	class="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 text-center"
>
	<div class="mb-6 rounded-full bg-gray-200 p-4">
		<Lightbulb class="h-12 w-12 text-gray-400" />
	</div>

	<h3 class="mb-2 text-xl font-semibold text-gray-700">هنوز موقعیتی اضافه نکرده‌اید</h3>

	<p class="mb-6 max-w-sm text-sm text-gray-500">
		برای مشاهده برنامه قطعی برق، ابتدا موقعیت‌های مورد نظر خود را اضافه کنید
	</p>

	<button
		type="button"
		onclick={onAddLocation}
		class="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl"
	>
		<Plus class="h-5 w-5" />
		<span>افزودن اولین موقعیت</span>
	</button>
</div>
