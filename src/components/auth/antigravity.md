# Authentication Components Module (`src/components/auth`)

## Purpose
Provides the user authentication card, citizen registration workflow, modal container, and form input controls for the Gandhidham CivicFix platform. Built with functional React components, hooks, Tailwind CSS design tokens, and `@phosphor-icons/react`.

## Adherence to Architecture Rules
- **Seamless In-Place Toggle**: `LoginCard.tsx` transitions seamlessly between Login and Registration modes within the identical container (`max-w-[440px]`, `rounded-3xl`, matching shadows and borders) with zero route navigation or layout shifts.
- **Input Preservation**: Entered inputs in Login and Registration modes are preserved when toggling back and forth between modes.
- **Auto-assigned Role**: Role selection is strictly non-selectable in the UI and automatically assigned as `"citizen"`.
- **Client-Side Validation**: Immediate feedback on required fields, email format, duplicate prevention against the mock user store, 10-digit phone verification, 8+ character password strength rule, and confirm password matching.
- **Password Masking**: Both password and confirm-password fields provide independent show/hide toggles via `@phosphor-icons/react` (`Eye` and `EyeSlash`).
- **Decoupled Mock Store**: Mock user state is managed in `src/lib/mockUsers.ts`, decoupled and importable in web, React Native (Expo), and Node test environments.
- **Non-Negotiable Isolation**: All existing Staff, Admin, and Citizen panel components outside the auth card remain strictly untouched.

## Components Breakdown
1. `LoginCard.tsx`: Unified, validated authentication card supporting in-place toggle between Login and Registration modes with loading indicators, error feedback, and success state auto-transition.
2. `RegisterCard.tsx`: Backward-compatible export wrapping the validated card in register mode.
3. `AuthModal.tsx`: Accessible modal dialog mounting the auth card with backdrop blur and active session badge.
4. `FormInput.tsx`: Floating-ready text/password input control with leading Phosphor icons, password visibility toggles, and inline error feedback.
5. `DotGridDecoration.tsx`: Subtle decorative corner pattern honoring the CivicFix design rhythm.
