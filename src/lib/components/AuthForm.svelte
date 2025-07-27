<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../routes/$types';

	let { form }: { form: ActionData } = $props();

	let fields = $state({
		mobile: '',
		code: ''
	});
	let sendOtpLoading = $state(false);
	let verifyOtpLoading = $state(false);

	// Reactive validation using $derived
	let isMobileValid = $derived(/^09[0-9]{9}$/.test(fields.mobile));
	let isCodeValid = $derived(/^[0-9]{6}$/.test(fields.code));
</script>

<div class="flex min-h-[60vh] items-center justify-center p-5">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
		<h2 class="mb-6 text-center text-2xl font-semibold text-gray-900">ورود یا ثبت‌نام</h2>

		<!-- Form for sending OTP -->
		<form
			method="POST"
			action="?/sendOtp"
			class="mb-4"
			use:enhance={() => {
				sendOtpLoading = true;
				return ({ update }) => {
					sendOtpLoading = false;
					update({ reset: false }); // Prevent form fields from resetting
				};
			}}
		>
			<label for="mobile" class="mb-2 block font-medium text-gray-700">شماره موبایل</label>
			<div class="flex items-start gap-2">
				<div class="flex-grow">
					<input
						type="tel"
						id="mobile"
						name="mobile"
						bind:value={fields.mobile}
						placeholder="09xxxxxxxxx"
						required
						maxlength="11"
						class="w-full rounded-lg border-2 p-3 text-base transition-colors focus:outline-none {fields.mobile &&
						!isMobileValid
							? 'border-red-500 focus:border-red-500'
							: 'border-gray-200 focus:border-blue-500'}"
					/>
					{#if fields.mobile && !isMobileValid}
						<p class="mt-1 text-sm text-red-600">شماره موبایل باید 11 رقم باشد و با 09 شروع شود.</p>
					{/if}
				</div>
				<button
					type="submit"
					disabled={sendOtpLoading || !isMobileValid}
					class="shrink-0 rounded-lg bg-gray-700 px-4 py-3 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
				>
					{sendOtpLoading ? '...' : 'ارسال کد'}
				</button>
			</div>
		</form>

		<!-- Display OTP status message -->
		{#if form?.type === 'sendOtp'}
			<div
				class="mb-4 rounded-md p-3 text-sm {form.success
					? 'bg-blue-50 text-blue-700'
					: 'border border-red-200 bg-red-50 text-red-600'}"
			>
				{form.message}
			</div>
		{/if}

		<!-- Form for verifying OTP and logging in -->
		<form
			method="POST"
			action="?/verifyOtp"
			use:enhance={() => {
				verifyOtpLoading = true;
				return ({ update }) => {
					verifyOtpLoading = false;
					update();
				};
			}}
		>
			<div class="mb-5">
				<label for="code" class="mb-2 block font-medium text-gray-700">کد تایید</label>
				<input
					type="text"
					id="code"
					name="code"
					bind:value={fields.code}
					placeholder="کد ۶ رقمی"
					required
					maxlength="6"
					class="w-full rounded-lg border-2 border-gray-200 p-3 text-base transition-colors focus:border-blue-500 focus:outline-none"
				/>
			</div>

			{#if form?.type === 'verifyOtp' && !form?.success}
				<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
					{form.message}
				</div>
			{/if}

			<button
				type="submit"
				disabled={verifyOtpLoading || !isMobileValid || !isCodeValid}
				class="w-full cursor-pointer rounded-lg border-none bg-blue-600 p-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{verifyOtpLoading ? 'در حال تایید...' : 'تایید و ورود'}
			</button>
		</form>
	</div>
</div>
