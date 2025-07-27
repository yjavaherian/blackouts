# Codebase Review and Issue Report

## 1. Summary

This document outlines the findings of a comprehensive code review. The application has a solid foundation but contains several issues across security, performance, code quality, and modern practices. Addressing these issues will improve the application's robustness, security, maintainability, and user experience.

The most critical issues to address are the **Security Vulnerabilities (Section 2)**.

---

## 2. Security Issues (High Priority)

These issues represent significant risks and should be addressed immediately.

| ID   | Issue                         | File(s) Affected                     | Recommendation                                                                                                                                                                  |
| :--- | :---------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S-1  | **Insecure OTP Verification** | `AuthForm.svelte`, `+page.server.ts` | Store the user's mobile number in a secure, httpOnly cookie or server-side session during the OTP process instead of trusting the value posted from a hidden client-side field. |
| NI-5 | **Default encryption key**    | `crypto.ts`                          | The `crypto.ts` file uses a default encryption key if the `ENCRYPTION_KEY` environment variable is not set. This is a security risk and should be addressed.                    |

---

## 3. Bad Code, Duplication, and Poor Practices

| ID   | Issue                            | File(s) Affected                                  | Recommendation                                                                                                                                                                                                                                   |
| :--- | :------------------------------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BC-1 | **Component Logic Duplication**  | `CalendarWeek.svelte`, `LocationCard.svelte`      | Refactor the responsive view in `CalendarWeek` to use a single, adaptive HTML structure. Extract the print logic from `LocationCard` into a dedicated, reusable component and/or utility function to avoid duplicating date and rendering logic. |
| BC-3 | **Fragile `setTimeout` Usage**   | `AddLocationDialog.svelte`, `LocationCard.svelte` | Replace `setTimeout` calls with more reliable Svelte mechanisms. Use `$effect` for reacting to state changes, Svelte actions for DOM manipulations, or transition events.                                                                        |
| BC-5 | **Hardcoded HTML/CSS in String** | `LocationCard.svelte`                             | Create a new Svelte component for the printable view. Use standard Svelte templating and a `@media print` stylesheet to control the print layout. This is far more maintainable than generating HTML in a string.                                |

---

## 4. General Code Quality and Improvements

| ID  | Issue                      | File(s) Affected           | Recommendation -                                                                                                                                                                        |
| :-- | :------------------------- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q-1 | **Missing Focus Trapping** | `AddLocationDialog.svelte` | Implement focus trapping for the modal dialog to improve accessibility. This prevents keyboard focus from leaving the modal when it is open. Use a Svelte action or a library for this. |
| Q-2 | **Complex Date Logic**     | `utils.ts`                 | Refactor or add comments to the `getWeekDates` function to clarify its logic. Generating dates in chronological order and reversing only for display would be more conventional.        |
