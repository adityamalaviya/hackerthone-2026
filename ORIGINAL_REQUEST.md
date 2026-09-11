# Original User Request

## 2026-09-11T10:07:46Z

This is a single self-contained fix; keep it small and focused. Implement the frontend-only Registration (Sign Up) flow for a civic issue reporting platform integrated directly into the existing Login card, with shared cross-platform mock user state, client-side validation, password masking, and automatic "citizen" role assignment.

Working directory: d:/hackerthone-2026
Integrity mode: development

## Requirements

### R1. Login / Sign Up Card Toggle
- Provide a "Don't have an account? Sign Up" toggle on the Login card that transitions the card into Registration mode in place, without route navigation or disconnected layout shifts.
- Provide an "Already have an account? Sign In" toggle that transitions back to Login mode without unnecessarily discarding entered inputs.
- Keep card dimensions, rounded borders, shadows, and design tokens visually consistent with the existing Login card.
- Strict constraint: Do not modify any existing Staff, Admin, or Citizen panel components, layouts, or styles outside the auth card.

### R2. Registration Form & Client-Side Validation
- Include input fields for: Full Name (required), Email (required), Phone Number (required), Password (required, 8+ characters minimum with basic strength rule), and Confirm Password (required).
- Provide mask toggles (show/hide password visibility icon) on both password and confirm-password fields.
- Validate inputs client-side:
  - Empty required fields show inline feedback, and the submit button remains disabled until valid.
  - Email format validation, plus duplicate check against the mock user store displaying an inline error: "Email already registered".
  - Phone number format validation.
  - Confirm password matching check displaying an inline error: "Passwords do not match".
- Role is strictly non-selectable (no role selector or dropdown in the UI). Role is auto-assigned as "citizen".

### R3. Mock Data Management & Submission Workflow
- Structure mock user data in a clean, shared JS/TS module importable by both web (React) and mobile (React Native / Expo) builds, reconciling with existing session/user data models.
- On valid submit, show an active loading state on the submit button with a simulated network delay (~500ms–1000ms).
- Append a new mock user object containing: `user_id` (generated), `full_name`, `email`, `phone_number`, `password` (with an explicit code comment indicating a real backend must hash it), `role: "citizen"`, `department: null`, `status: "active"`, and `created_at` (current timestamp).
- Display a clear success state and automatically transition back to Login mode.
- Add clear code comments marking where real API / backend endpoints will replace mock logic.

### R4. Automated Verification
- Verify the solution with programmatic unit/component tests covering field validation, duplicate email prevention, password mismatch detection, and successful registration state transition.
- Verify that TypeScript compiles cleanly with zero errors (`npm run build` or typecheck).

## Acceptance Criteria

### Functional & UI Consistency
- [ ] Card seamlessly toggles between Login and Register modes with matching container styling and no visual jarring.
- [ ] Role is never user-selectable anywhere in the registration UI and always defaults to "citizen".
- [ ] Eye icon toggles password and confirm-password masking between plain text and masked characters.
- [ ] Submit button is disabled when required inputs are empty or invalid, and enters a loading spinner state during mock submission.
- [ ] Attempting registration with an already-registered email produces an inline error on the email field.
- [ ] Mismatched passwords produce an inline error on the confirm-password field.
- [ ] Successful registration generates a complete citizen user record in the shared mock store and auto-switches to the Login view.
- [ ] Existing staff, admin, and citizen panel files, styling, and navigation remain strictly untouched.

### Code & Test Quality
- [ ] Mock users module is decoupled and exportable for both web and mobile environments.
- [ ] All replacement points for real authentication APIs are clearly commented.
- [ ] Automated tests pass verifying the registration validation and mock submission behavior.
- [ ] TypeScript compilation passes with zero type errors.
