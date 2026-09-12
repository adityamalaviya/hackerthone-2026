# 🔐 Role & Email-Based Login Flow

> **Core principle:** One login portal, three roles. The user's email determines which panel they land on — automatically.

---

## 🗺️ Flow Diagram

> See attached image: `role-email-login-flow.png`

---

## 🔁 Final Flow Summary

```
Login → Email check (admin?) → Email check (staff table?) → Citizen (default)
```

| Email type | Destination |
|---|---|
| Pre-approved unique admin email | Admin panel |
| Email in staff table (added by admin) | Staff panel (dept. scoped) |
| Any other email | Citizen panel (default) |

---

## ① Login Routing

**Single login URL for all three roles.**

```
User enters email + password
       │
       ▼
 ┌─────────────────────────┐
 │ Unique admin email?     │──Yes──► Admin panel
 └─────────────────────────┘
       │ No
       ▼
 ┌─────────────────────────┐
 │ Email in staff table?   │──Yes──► Staff panel (dept. scoped)
 └─────────────────────────┘
       │ No
       ▼
   Citizen panel (default)
```

**Rules:**
- Admin email is hardcoded / pre-approved in the system — not manageable via UI.
- Staff emails are added by admin through the staff management form.
- Any other registered email lands on the citizen panel automatically.
- No separate login URLs. Role routing is invisible to the user.

---

## ② Citizen — Report Issue Flow

```
Open app
   │
   ▼
Click "Report Issue"
   │
   ▼
Logged in? ──No──► Redirect to Login ──(after login)──► Back to Report Issue
   │ Yes
   ▼
Report Issue form
  · Category
  · Description
  · Location
  · Priority
   │
   ▼
Submit
   │
   ▼
Status: Pending → Ticket ID generated → Notification sent (email / in-app)
   │
   ▼
Track issue status in citizen dashboard
```

**Auth guard rule:** Clicking "Report Issue" without being logged in always redirects to login first, then returns to the form after successful login.

---

## ③ Staff — Issue Handling Flow

```
Staff login  (email must be in staff table)
   │
   ▼
Staff dashboard  (only sees issues assigned to their department)
   │
   ▼
Issue received  →  Status: Pending
   │
   ▼
Review issue
   │
   ├──► Mark In-Progress
   │         │
   │         ▼
   │    Mark Resolved ──► Notify citizen
   │
   └──► Escalate to admin (complex / blocked issues)
```

**Staff scope:** Staff can only see issues that belong to their assigned department — no cross-department visibility.

---

## ④ Admin — Staff Management

Admin has full CRUD control over staff accounts. **Email is the identity key.**

### Add staff

```
Admin dashboard → Staff management → Add staff
   │
   ▼
Fill form:
  · Name
  · Email          ← identity key (grants staff panel access on next login)
  · Department
   │
   ▼
Validate (check email is unique)
   │
   ▼
Save to staff table → Email now grants staff panel access
```

### Update staff

```
Admin selects staff → Edit record
  · Can change: Department only
  · Cannot change: Name, Email
   │
   ▼
DB updated → Department reassigned → Access retained
```

### Delete staff

```
Admin selects staff → Confirm delete (irreversible)
   │
   ▼
Email removed from staff table
   │
   ▼
On next login → email no longer in staff table → auto-routed to citizen panel
```

> ⚠️ Deletion is immediate. No grace period. The staff member's next login will land on the citizen panel.

---

## ⑤ Admin — Issue Control

Admin sees **all issues across all citizens and all departments.**

```
Admin dashboard → View all issues (global)
   │
   ├──► Reassign → assign to any staff member in any dept.
   │
   ├──► Override decision → change status / priority
   │
   ├──► Handle escalations from staff
   │
   └──► Close / resolve → audit log updated
```

**Admin powers over staff decisions:**
- Can override any status set by staff.
- Can change issue priority.
- Can reassign to a different staff member or department.
- All admin actions are written to the audit log.

---

## ⚙️ System Rules

| Rule | Detail |
|---|---|
| Email is identity | Adding an email to the staff table grants access. Removing it revokes it instantly. |
| Admin email | Hardcoded / pre-approved, not manageable via staff form. |
| Single login URL | Role is invisible — same page for all three roles. |
| Auth guard | Citizen cannot access report form without login. |
| Staff scope | Staff only see issues for their assigned department. |
| Admin scope | Admin sees all issues, all departments, all citizens. |
| Audit log | Every admin action (reassign, override, close) is logged. |
| Delete = revoke | Deleting staff record auto-reverts login to citizen on next session. |

---

## 🚀 Why This Design Works

- **Zero separate portals** — one URL, routing is automatic and silent.
- **Email as identity key** — simple, no separate role toggle UI needed.
- **Instant access control** — adding or removing a staff record takes effect on the next login.
- **Dept. scoped staff** — prevents cross-department data leaks without complex permission tables.
- **Full admin override** — admin is never blocked by a staff decision.
- **Citizen is the safe default** — unknown emails never accidentally land on staff or admin panels.
