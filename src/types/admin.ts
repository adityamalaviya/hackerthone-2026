/**
 * Strict TypeScript Types for CivicFix Admin Panel
 * Used cross-platform across Web (React) and Mobile (React Native / Expo).
 */

export type CivicCategory =
  | 'Pothole'
  | 'Streetlight'
  | 'Garbage'
  | 'Water Leakage'
  | 'Drainage'
  | 'Other';

export type IssueStatus =
  | 'Reported'
  | 'Acknowledged'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type DepartmentName =
  | 'Roads & Infrastructure'
  | 'Public Works & Electricity'
  | 'Water & Sewage'
  | 'Sanitation & Solid Waste'
  | 'Drainage & Flood Control';

export interface IssueFlagDetails {
  isFlagged: boolean;
  type?: 'duplicate' | 'invalid' | 'spam';
  reason?: string;
  flaggedByStaffId?: string;
  flaggedByStaffName?: string;
  flaggedAt?: string;
}

export interface AdminIssue {
  id: string;
  title: string;
  description: string;
  category: CivicCategory;
  severity: SeverityLevel;
  department: DepartmentName;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  status: IssueStatus;
  createdDate: string;
  createdAtTimestamp: number;
  slaDeadline: string;
  slaDeadlineTimestamp: number;
  isSlaBreached: boolean;
  isEscalated: boolean;
  escalationReason?: string;
  flagged: IssueFlagDetails;
  ward: string;
  locationName: string;
  latitude: number;
  longitude: number;
  votes: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: DepartmentName;
  status: 'active' | 'disabled';
  activeAssignedCount: number;
  phone?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  timestampMs: number;
  actorId: string;
  actorName: string;
  action: string;
  details: string;
  issueId?: string;
}

export type AdminTab =
  | 'overview'
  | 'all-issues'
  | 'pending-review'
  | 'escalations'
  | 'staff'
  | 'audit-log';

export interface IssueFilterState {
  search: string;
  department: string;
  category: string;
  status: string;
  severity: string;
  dateRange: 'all' | 'today' | 'last7days' | 'last30days';
  sortBy: 'createdDate' | 'slaDeadline' | 'severity' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface AdminMetrics {
  totalIssues: number;
  resolvedCount: number;
  unresolvedCount: number;
  escalatedCount: number;
  categoryDistribution: Array<{
    category: CivicCategory;
    count: number;
    percentage: number;
  }>;
  departmentDistribution: Array<{
    department: DepartmentName;
    count: number;
    pendingCount: number;
  }>;
  resolutionTrend: Array<{
    day: string;
    resolved: number;
    avgHours: number;
  }>;
}

export interface AssignIssuePayload {
  issueId: string;
  targetDepartment: DepartmentName;
  targetStaffId: string;
  targetStaffName: string;
}

export interface FlagResolutionPayload {
  issueId: string;
  action: 'approve' | 'reject';
  adminNotes?: string;
}

export interface AddStaffPayload {
  name: string;
  email: string;
  department: DepartmentName;
  phone?: string;
}
