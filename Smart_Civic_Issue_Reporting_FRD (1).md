# Smart Civic Issue Reporting System
## Functional Requirements Document (FRD)

**Purpose:** Enable citizens to report local civic issues (potholes, broken streetlights, garbage overflow, leaking pipelines, etc.) with a photo and location, and track resolution status transparently — from *Reported* to *Resolved*.

---

## 1. User Roles

| Role | Description |
|---|---|
| **Citizen** | Reports issues, tracks status, upvotes, gives feedback |
| **Authority / Municipal Staff** | Views, assigns, updates, and resolves issues |
| **Admin (Super Admin)** | Manages departments, staff, categories, analytics |

---

## 2. Functional Requirements — Citizen Module

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Citizen can register/login via Mobile Email, or Google Sign-In| Must |
| FR-02 | Citizen can report an issue by capturing/uploading a **photo** | Must |
| FR-03 | System auto-captures **GPS location** (lat/long + address via reverse geocoding) at time of report | Must |
| FR-04 | Citizen selects an **issue category** (Pothole, Streetlight, Garbage, Water Leakage, Drainage, Other) | Must |
| FR-05 | Citizen adds a short **text description** (optional) | Should |
| FR-06 | Citizen can view **status of their reported issue**: Reported → Acknowledged → In Progress → Resolved → Closed | Must |
| FR-07 | Citizen receives **notifications** (push/SMS/email) on every status change | Must |
| FR-08 | Citizen can view **nearby issues on a map** (pins colored by status) | Must |
| FR-10 | Citizen can view **history of all issues they've reported** | Must |
| FR-11 | Citizen can **search/filter** issues by category, status, or date | Should |
| FR-12 | Citizen can give a **rating/feedback** once issue is marked Resolved | Should |
| FR-13 | Citizen can share issue link/details on social media (for visibility/pressure) | Could |

---

## 3. Functional Requirements — Authority/Admin Module

| ID | Requirement | Priority |
|---|---|---|
| FR-14 | Authority has a **dashboard** listing all issues (table + map view) | Must |
| FR-15 | Authority can **filter/sort** issues by category, area, priority, or date | Must |
| FR-16 | Authority can **change issue status** and add remarks at each stage | Must |
| FR-17 | Authority can **assign** an issue to a department/worker | Should |
| FR-18 | Authority can **upload proof-of-resolution photo** before marking Resolved | Must |
| FR-19 | System auto-**prioritizes** issues with more upvotes / older pending time | Should |
| FR-20 | Authority can **reject/mark as duplicate or spam** with a reason | Should |
| FR-21 | Admin can view **analytics**: issues per area, avg. resolution time, category-wise counts | Could |
| FR-22 | Admin can manage departments, staff accounts, and categories | Could |

---

## 4. System-Level Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-23 | **Duplicate detection**: flag new reports within a small radius + same category as existing open issue | Should |
| FR-24 | **Status timeline/audit log** stored for every issue (who changed what, when) | Must |
| FR-25 | **Map integration** (Google Maps / OpenStreetMap API) for pinning & viewing issues | Must |
| FR-26 | **Cloud image storage** for uploaded photos | Must |
| FR-27 | **Role-based access control** (citizen vs authority vs admin) | Must |
| FR-28 | **Notification engine** (Firebase Cloud Messaging / SMS gateway / email service) | Must |
| FR-29 | AI-based **auto-tagging** of issue category from photo (stretch goal) | Could |

---

## 5. Non-Functional Requirements (Quick Reference)

- **Performance:** Issue submission should complete in under 3 seconds on average network.
- **Scalability:** Should handle multiple citizens reporting simultaneously in the same area.
- **Security:** Authenticated APIs, image upload validation, role-based data access.
- **Usability:** Report flow should take ≤ 3 taps (Photo → Auto-location → Category → Submit).
- **Availability:** Core reporting flow should work even on low bandwidth (compress images before upload).

---

## 6. Suggested MVP Scope for Hackathon (Time-Boxed)

**Build first (Core Demo Flow):**
1. Citizen login (simple)
2. Report issue — photo + auto GPS + category + description
3. Status tracker (Reported → In Progress → Resolved) — even if manually updated by admin for demo
4. Map view showing all reported issues with status-colored pins
5. Basic admin panel to change status + upload resolution proof

**Add if time permits:**
- Upvoting / duplicate merge
- Push notifications
- Analytics dashboard

---

## 7. Suggested Tech Stack (optional reference)

- **Frontend (Citizen App):** react.js , tailwind css
- **Mobile App (Android/iOS):** react native , expo
- **Backend:** appwrite function 
- **Database:** appwrite DB
- **Storage:** appwrite storage
- **bucket :** appwrite bucket (only one bucket) 
- **Maps:** Leaflet 
- **Notifications:** appwrite notification

---

*This FRD is structured to prioritize a working end-to-end demo (report → track → resolve) since that's what judges typically want to see live, with stretch features layered on top if time allows.*
