import { toast } from 'svelte-sonner';
import type { ActionData } from '../types';

/**
 * Handles toast notifications from form actions
 */
export function useToast(form: ActionData | null | undefined) {
	if (form?.toast) {
		const toastType = form.toast.type as keyof typeof toast;
		if (typeof toast[toastType] === 'function') {
			(toast[toastType] as (message: string) => void)(form.toast.message);
		}
	}
}
