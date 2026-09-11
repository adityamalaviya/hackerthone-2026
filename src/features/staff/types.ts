/**
 * Staff Module Types
 * Shared between Web and Mobile (React Native / Expo) implementations.
 */

export type StaffDepartment =
  | 'Roads & Infrastructure'
  | 'Electrical & Lighting'
  | 'Sanitation & Waste'
  | 'Water & Sewage';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueCategory =
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

export interface InternalRemark {
  id: string;
  staffId: string;
  staffName: string;
  text: string;
  timestamp: string;
}

export interface IssueFlag {
  isFlagged: boolean;
  reason: string;
  flaggedAt: string;
  flaggedByStaffId: string;
  flaggedByStaffName: string;
}

export interface IssueEscalation {
  isEscalated: boolean;
  note?: string;
  escalatedAt: string;
  escalatedByStaffId: string;
}

export interface IssueResolution {
  proofPhotoUrl: string;
  notes: string;
  resolvedAt: string;
  resolvedByStaffId: string;
}

export interface StaffIssue {
  id: string;
  category: IssueCategory;
  department: StaffDepartment;
  severity: IssueSeverity;
  shortDescription: string;
  citizenDescription: string;
  photoUrl: string;
  locationName: string;
  ward: string;
  latitude: number;
  longitude: number;
  assignedDate: string; // ISO string
  slaDeadline: string;  // ISO string
  status: IssueStatus;
  internalRemarks: InternalRemark[];
  flag?: IssueFlag;
  escalation?: IssueEscalation;
  resolution?: IssueResolution;
}

export interface StaffFilterOptions {
  searchQuery?: string;
  status?: IssueStatus | 'All';
  severity?: IssueSeverity | 'All';
  sortBy?: 'sla' | 'assignedDate' | 'severity';
}
