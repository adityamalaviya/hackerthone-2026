# Library Module (`src/lib`)

## Purpose
Provides core business logic, authentication services, client-side input validation, mock user persistence, and municipal admin operations for the Gandhidham CivicFix platform.

## Architecture & Submodules
- `mockUsers.ts`: Shared, cross-platform in-memory and localStorage mock user store with automatic "citizen" role assignment and realistic network delay.
- `authValidation.ts`: Pure client-side validation functions covering names, emails, phone numbers, and passwords.
- `appwrite.ts`: Authentication service abstraction supporting Appwrite backend integration, social auth, and safe multi-environment storage fallbacks.
- `admin/`: Admin domain logic, audit logs, and CSV export utilities.
