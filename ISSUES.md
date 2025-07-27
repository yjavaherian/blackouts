# Codebase Review and Issue Report

## 1. Summary

This document outlines the findings of a comprehensive code review. The application has a solid foundation but contains several issues across security, performance, code quality, and modern practices. Addressing these issues will improve the application's robustness, security, maintainability, and user experience.

The most critical issues to address are the **Security Vulnerabilities (Section 2)** and migrating all components to **Svelte 5 Syntax (Section 3)** to align with the project's setup.

---

## 2. Security Issues (High Priority)

These issues represent significant risks and should be addressed immediately.

| ID  | Issue                             | File(s) Affected                     | Recommendation                                                                                                                                                                  |
| :-- | :-------------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S-1 | **Insecure OTP Verification**     | `AuthForm.svelte`, `+page.server.ts` | Store the user's mobile number in a secure, httpOnly cookie or server-side session during the OTP process instead of trusting the value posted from a hidden client-side field. |
| S-2 | **Plaintext API Token Storage**   | `schema.ts`, `auth.ts`               | Encrypt the `authToken` field in the `users` table at rest in the database using a strong encryption library (e.g., using Node.js `crypto`).                                    |
| S-3 | **Insecure Production Cookie**    | `+page.server.ts`                    | The `secure` flag for the session cookie must be `true` in production. Tie this to an environment variable (e.g., `NODE_ENV === 'production'`).                                 |
| S-4 | **Hardcoded API URLs**            | `api.ts`, `auth.ts`                  | Move all external API URLs to environment variables (`.env`) to avoid committing them to source control and to support different environments.                                  |
| S-5 | **API Token Leakage to `locals`** | `session.ts`, `hooks.server.ts`      | Modify `validateSession` to not return the sensitive `authToken` as part of the user object that gets placed in `event.locals`. Only query for data needed for the session.     |

---

## 3. Svelte 5 Syntax Upgrade (High Priority)

The project is configured for Svelte 5 (`+layout.svelte`), but nearly all other components use outdated Svelte 4 syntax. This creates an inconsistent and hard-to-maintain codebase.

| ID   | Issue                        | File(s) Affected                                                                                                                                  | Recommendation                                                                                                                                                                                                                                                                                        |
| :--- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V5-1 | **Outdated Svelte 4 Syntax** | `AddLocationDialog`, `AppHeader`, `AuthForm`, `CalendarDay`, `CalendarWeek`, `EmptyState`, `FloatingActionButton`, `LocationCard`, `+page.svelte` | Refactor all components to use Svelte 5 Runes. Replace `export let` with `let {...} = $props()`. Use `$state` for local component state. Convert `$: ` blocks to `$derived` for computed values and `$effect` for side effects. This will modernize the code and improve performance and readability. |

---

## 4. Bad Code, Duplication, and Poor Practices

| ID    | Issue                                                        | File(s) Affected                                  | Recommendation                                                                                                                                                                                                                                   |
| :---- | :----------------------------------------------------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BC-1  | **Component Logic Duplication**                              | `CalendarWeek.svelte`, `LocationCard.svelte`      | Refactor the responsive view in `CalendarWeek` to use a single, adaptive HTML structure. Extract the print logic from `LocationCard` into a dedicated, reusable component and/or utility function to avoid duplicating date and rendering logic. |
| BC-2  | **Duplicated Constants**                                     | `date-utils.ts`, `utils.ts`                       | Define the `PERSIAN_WEEKDAYS` constant in one file (e.g., `date-utils.ts`) and import it where needed to ensure a single source of truth.                                                                                                        |
| BC-3  | **Fragile `setTimeout` Usage**                               | `AddLocationDialog.svelte`, `LocationCard.svelte` | Replace `setTimeout` calls with more reliable Svelte mechanisms. Use `$effect` for reacting to state changes, Svelte actions for DOM manipulations, or transition events.                                                                        |
| BC-4  | **Unsafe `any` Type**                                        | `AuthForm.svelte`                                 | Replace `export let form: any;` with the strongly-typed `export let form: ActionData;` to improve type safety and enable better static analysis.                                                                                                 |
| BC-5  | **Hardcoded HTML/CSS in String**                             | `LocationCard.svelte`                             | Create a new Svelte component for the printable view. Use standard Svelte templating and a `@media print` stylesheet to control the print layout. This is far more maintainable than generating HTML in a string.                                |
| BC-6  | **Redundant `toReversed()` call in `CalendarWeek.svelte`**   | `CalendarWeek.svelte`                             | The `PERSIAN_WEEKDAYS` array is reversed before being used in the mobile view, but it's already in the correct order.                                                                                                                            |
| BC-7  | **Unnecessary `toReversed()` call in `LocationCard.svelte`** | `LocationCard.svelte`                             | The `PERSIAN_WEEKDAYS` array is reversed before being used in the print view, but it's already in the correct order.                                                                                                                             |
| BC-8  | **Useless `else` block in `AppHeader.svelte`**               | `AppHeader.svelte`                                | There is a useless `else` block in the template.                                                                                                                                                                                                 |
| BC-9  | **Duplicate `PERSIAN_WEEKDAYS` constant**                    | `date-utils.ts`, `utils.ts`                       | The `PERSIAN_WEEKDAYS` constant is defined in both `date-utils.ts` and `utils.ts`.                                                                                                                                                               |
| BC-10 | **Inconsistent `Date` object creation in `date-utils.ts`**   | `date-utils.ts`                                   | The `getTodayJalali` function creates a new `Date` object without any arguments, which is not recommended.                                                                                                                                       |

---

## 5. Performance and Optimization

| ID  | Issue                             | File(s) Affected      | Recommendation                                                                                                                                                                                                                     |
| :-- | :-------------------------------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-1 | **Blocking Page Load on Refresh** | `+page.server.ts`     | Trigger the `refreshAllBlackouts` function in the background (fire-and-forget) and immediately return the stale data to the user. Do not `await` it in the `load` function. This will prevent slow API calls from blocking the UI. |
| P-2 | **Sequential API Calls**          | `api.ts`              | In `refreshAllBlackouts`, use `Promise.all` to run the `refreshBlackoutsForLocation` calls in parallel for all of a user's locations. This will dramatically reduce the total refresh time.                                        |
| P-3 | **Random Session Cleanup**        | `hooks.server.ts`     | Replace the random session cleanup with a proper scheduled job (e.g., a cron job) that runs a script to call `cleanupExpiredSessions` periodically (e.g., once a day).                                                             |
| P-4 | **Inefficient Reactive Logic**    | `CalendarWeek.svelte` | Convert `$: weekDates = getWeekDates()` to a simple `const` as it does not depend on any props. Use `$derived` for `blackoutsByDate` as it is derived from the `location` prop.                                                    |

---

## 6. Error Handling and Robustness

| ID   | Issue                      | File(s) Affected  | Recommendation                                                                                                                                                                                                                                                  |
| :--- | :------------------------- | :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EH-1 | **Swallowing API Errors**  | `api.ts`          | Modify `fetchBlackoutsFromApi` to throw an error or return a result object (e.g., `{ success: false, error: ... }`) when an API call fails. This allows the calling function to handle the error gracefully instead of assuming an empty array means "no data". |
| EH-2 | **Lack of DB Transaction** | `api.ts`          | Wrap the `delete` and `insert` operations in `refreshBlackoutsForLocation` within a database transaction (`db.transaction(...)`) to ensure the operations are atomic. If the insert fails, the delete will be rolled back, preventing data loss.                |
| EH-3 | **Generic Action Errors**  | `+page.server.ts` | Enhance form action error handling to inspect database or API errors. For example, catch a unique constraint violation on `addLocation` and return a specific message like "A location with this Bill ID already exists."                                       |

---

## 7. General Code Quality and Improvements

| ID  | Issue                              | File(s) Affected              | Recommendation -                                                                                                                                                                                                                                                                                         |
| :-- | :--------------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-1 | **Missing Focus Trapping**         | `AddLocationDialog.svelte`    | Implement focus trapping for the modal dialog to improve accessibility. This prevents keyboard focus from leaving the modal when it is open. Use a Svelte action or a library for this.                                                                                                                  |
| Q-2 | **Complex Date Logic**             | `utils.ts`                    | Refactor or add comments to the `getWeekDates` function to clarify its logic. Generating dates in chronological order and reversing only for display would be more conventional.                                                                                                                         |
| Q-3 | **No Internationalization (i18n)** | All components and routes     | All user-facing strings are hardcoded in Persian. For future maintainability and to support other languages, integrate an i18n library like `svelte-i18n`.                                                                                                                                               |
| Q-4 | **Non-idiomatic `useToast` Hook**  | `useToast.ts`, `+page.svelte` | The `useToast` function is called from a reactive block (`$: useToast(form)`). As part of the Svelte 5 migration, this should be converted to use an `$effect` that observes the `form` prop. This makes the data flow more explicit and aligns with modern Svelte 5 patterns for handling side effects. |
