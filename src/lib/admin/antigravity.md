# Admin State & Data Layer Module (`src/lib/admin`)

## Purpose
Provides the data structures, mock data engines, client-side CSV generation, and shared reactive state hook for the CivicFix Super Admin Panel.

## Architecture
- **Cross-Platform Compatibility**: The data models (`src/types/admin.ts`), mock data, and state machine (`useAdminState.ts`) contain zero browser-only dependencies (except CSV triggering, which gracefully checks for DOM environment). The exact same hook and data types can be used in React Native Expo mobile apps.
- **Strict Typing**: Zero `any` types. All entities (`AdminIssue`, `StaffMember`, `AuditLogEntry`, `AdminMetrics`) are strictly typed.
- **Backend Ready**: Clear `// TODO:` comments mark every place where mock operations will be swapped for Appwrite or REST API endpoints.

## Exports
- `mockAdminData.ts`: `INITIAL_MOCK_ISSUES`, `INITIAL_MOCK_STAFF`, `INITIAL_MOCK_AUDIT_LOG`, `DEPARTMENTS`
- `exportCsv.ts`: `exportIssuesToCsv`
- `useAdminState.ts`: `useAdminState`
