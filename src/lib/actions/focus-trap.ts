import { tick } from 'svelte';

/**
 * Focus trap action for modal dialogs
 * Traps focus within the element and cycles through focusable elements
 */
export function focusTrap(node: HTMLElement) {
	const focusableElements =
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

	function getFocusableElements(): HTMLElement[] {
		return Array.from(node.querySelectorAll(focusableElements)) as HTMLElement[];
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		const focusable = getFocusableElements();
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey) {
			// Shift + Tab
			if (document.activeElement === first) {
				event.preventDefault();
				last.focus();
			}
		} else {
			// Tab
			if (document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	async function setInitialFocus() {
		await tick();
		const focusable = getFocusableElements();
		if (focusable.length > 0) {
			focusable[0].focus();
		}
	}

	// Set initial focus when the trap is activated
	setInitialFocus();

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
		}
	};
}
