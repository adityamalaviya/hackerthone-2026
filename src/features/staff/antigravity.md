# Staff Feature Module (`src/features/staff`)

## Purpose
Provides the shared domain models, status state machine, department-scoped mock datasets, and business logic hook (`useStaffIssues`) for municipal on-site staff handling civic issues.

## Architectural Boundaries
- **Cross-Platform Reasoning**: Designed to decouple state & workflow logic from the rendering framework. Types and state transition logic are 100% reusable across Web (React.js) and Mobile (React Native + Expo).
- **Zero Backend Assumption (Hackathon Demo)**: All interactions operate on reactive mock data persisted to localStorage.
- **Backend Security Scoping Notice**:
  `// TODO: backend must enforce department-scoping server-side, not just hide in UI`

## State Machine & SLA Rules
- Valid linear workflow: `Reported → Acknowledged → In Progress → Resolved`
- Illegal jumps (e.g. `Reported → Resolved`) are forbidden.
- Marking `Resolved` requires mandatory proof-of-resolution photo and resolution notes.
- Flagging as Duplicate/Invalid requires a mandatory reason and assigns `Pending Admin Review` without unilaterally closing the ticket.
- Escalation requests notify higher municipal authorities with optional notes.
