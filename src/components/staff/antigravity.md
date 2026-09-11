# Staff Panel UI Components Module (`src/components/staff`)

## Purpose
Provides the web user interface for the municipal field staff workstation, built exclusively with functional React components, hooks, Tailwind CSS design tokens, and `@phosphor-icons/react`.

## Adherence to Constraints & Architecture
- **Non-Negotiable Isolation**: All existing citizen panels, admin panels, and login components remain untouched.
- **Tailwind Compliance**: Strict adherence to Tailwind CSS utility classes; zero arbitrary class values.
- **Icons**: Exclusively `@phosphor-icons/react`.
- **Mobile First**: Optimized touch targets, responsive split/modal views for on-site mobile operations.
- **Simulated Latency**: Skeleton loading states and clean empty queue states.

## Components Breakdown
1. `StaffPanel.tsx`: Main staff dashboard, department selector, search and status tabs, demo notification actions.
2. `IssueQueueList.tsx`: Responsive list of department-scoped tickets with SLA countdown badges and severity indicators.
3. `IssueDetailModal.tsx`: Comprehensive modal detail view with citizen photo, GPS landmark, valid next-status transitions, remarks thread, flag action, and escalation action.
4. `ResolutionModal.tsx`: Mandatory proof-of-resolution photo attachment and notes verification dialog.
5. `FlagIssueModal.tsx`: Mandatory reason dialog for flagging issues for Admin review.
6. `EscalationModal.tsx`: Confirmation dialog for supervisor escalation with optional notes.
7. `NotificationToast.tsx`: Non-intrusive floating toast notification when an issue is assigned.
