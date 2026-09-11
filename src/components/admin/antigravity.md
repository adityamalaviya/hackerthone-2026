# Admin Panel UI Components Module (`src/components/admin`)

## Purpose
Provides the comprehensive administrative interface for the CivicFix platform, built exclusively with functional React components, hooks, Tailwind CSS design tokens, and `@phosphor-icons/react`.

## Adherence to Hackathon Constraints & Architecture Rules
- **Non-Negotiable Isolation**: All existing citizen panels, staff panels, login cards, and layouts remain untouched.
- **Tailwind Compliance**: Strict adherence to Tailwind CSS utility classes; zero arbitrary class values (no `w-[432px]`).
- **Icons**: Exclusively `@phosphor-icons/react`.
- **Accessibility & UX**: Includes keyboard navigation, screen reader labels, simulated fetch states with pulsing skeletons, and tailored empty states for every section.
- **Backend Readiness**: Explicit `// TODO:` comments mark all areas where real backend role checks and Appwrite REST/GraphQL endpoints will replace the frontend mock engine.

## Components Breakdown
1. `AdminPanel.tsx`: Master shell layout, navigation tabs, unrestricted Super Admin visibility banner, action notification toasts.
2. `AdminOverview.tsx`: Top summary cards (Total, Resolved, Unresolved, Escalated) and lightweight SVG/CSS analytics charts (Category breakdown, Department workload, 7-day turnaround trend).
3. `AllIssuesView.tsx`: System-wide table across all municipal departments with multi-criteria filtering (dept, category, status, severity, search, date range), sorting, and client-side CSV export.
4. `AssignModal.tsx`: Two-stage assignment dialog with cascaded Department -> Staff selector and an explicit confirmation step before committing reassignment.
5. `ReviewFlaggedView.tsx`: "Pending Review" queue displaying staff justifications for duplicate/invalid issues with mandatory Approve (Close) or Reject (Return to queue) decisions.
6. `EscalationQueueView.tsx`: Operational queue for SLA-breached reports and staff-escalated emergencies with overdue time calculations and quick-reassign actions.
7. `StaffManagementView.tsx`: Staff directory roster with Add Staff modal, enable/disable status toggling, and department reassignments.
8. `AuditLogView.tsx`: Immutable chronological event timeline with actor and keyword filters.
9. `EmptyState.tsx`: Reusable contextual empty state component.
10. `LoadingSkeleton.tsx`: Multi-type animated skeleton loader for simulated network latency.
