/**
 * CivicFix Issue Store
 * Central management and persistence for citizen-reported civic issues in Gandhidham.
 * Seamlessly integrates local storage, mock data, and Appwrite sync.
 */

import { CivicIssue, MOCK_ISSUES } from '../data/mockIssues';
import { GANDHIDHAM_LOCALITIES } from '../data/localities';
import { DepartmentName, SeverityLevel, CivicCategory } from '../types/admin';

export interface NewIssuePayload {
  title: string;
  category: CivicCategory;
  description: string;
  severity: SeverityLevel;
  localityValue: string;
  locationName: string;
  landmark?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  photoDataUrl?: string;
  reportedByName?: string;
  reportedByPhone?: string;
  reportedByEmail?: string;
  reportedByUserId?: string;
  isAnonymous?: boolean;
}

export interface StoredCivicReport extends CivicIssue {
  severity: SeverityLevel;
  department: DepartmentName;
  landmark?: string;
  photoDataUrl?: string;
  photoUrl?: string;
  reportedByName?: string;
  reportedByPhone?: string;
  reportedByEmail?: string;
  reportedByUserId?: string;
  isAnonymous?: boolean;
  createdAtIso: string;
  slaDeadline: string;
}

const STORAGE_KEY = 'civicfix_user_reported_issues';
const EVENT_NAME = 'civicfix:issue-added';

let inMemoryReports: StoredCivicReport[] = [];
type IssueListener = (newReport: StoredCivicReport) => void;
const memoryListeners = new Set<IssueListener>();

/**
 * Reset stored user reports (used in tests and session resets)
 */
export function resetStoredUserReports(): void {
  inMemoryReports = [];
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Read custom citizen reported issues from storage
 */
export function getStoredUserReports(): StoredCivicReport[] {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryReports = parsed;
          return inMemoryReports;
        }
      }
    } catch {
      // Fallback to memory
    }
  }
  return inMemoryReports;
}

/**
 * Maps civic issue categories to responsible Gandhidham municipal departments
 */
export function getDepartmentForCategory(category: CivicCategory): DepartmentName {
  switch (category) {
    case 'Pothole':
      return 'Roads & Infrastructure';
    case 'Streetlight':
      return 'Public Works & Electricity';
    case 'Water Leakage':
      return 'Water & Sewage';
    case 'Garbage':
      return 'Sanitation & Solid Waste';
    case 'Drainage':
      return 'Drainage & Flood Control';
    case 'Other':
    default:
      return 'Roads & Infrastructure';
  }
}

/**
 * Calculates estimated SLA turnaround based on severity level
 */
export function calculateSla(severity: SeverityLevel): { hours: number; deadlineLabel: string } {
  let hours = 48;
  switch (severity) {
    case 'Critical':
      hours = 12;
      break;
    case 'High':
      hours = 24;
      break;
    case 'Medium':
      hours = 48;
      break;
    case 'Low':
      hours = 72;
      break;
  }
  const deadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  return {
    hours,
    deadlineLabel: deadline.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/**
 * Derives ward name from locality value or defaults
 */
export function getWardForLocality(localityValue: string): string {
  const match = GANDHIDHAM_LOCALITIES.find(
    (l) => l.value === localityValue || l.label.toLowerCase().includes(localityValue.toLowerCase())
  );
  return match ? match.ward : 'Ward 4 (Central)';
}

/**
 * Persist a new civic issue report
 */
export function saveReportedIssue(payload: NewIssuePayload): StoredCivicReport {
  const existing = getStoredUserReports();
  const nextNum = 82 + existing.length;
  const ticketId = `CF-2026-${String(nextNum).padStart(3, '0')}`;

  const resolvedWard = payload.ward || getWardForLocality(payload.localityValue);
  const resolvedDept = getDepartmentForCategory(payload.category);
  const sla = calculateSla(payload.severity);

  // Default coordinate center for Gandhidham if GPS unavailable
  const lat = typeof payload.latitude === 'number' && !isNaN(payload.latitude) ? payload.latitude : 23.0792;
  const lng = typeof payload.longitude === 'number' && !isNaN(payload.longitude) ? payload.longitude : 70.1345;

  const now = new Date();

  const newReport: StoredCivicReport = {
    id: ticketId,
    title: payload.title.trim(),
    category: payload.category,
    description: payload.description.trim(),
    status: 'Reported',
    latitude: lat,
    longitude: lng,
    locationName: payload.locationName || (payload.landmark ? `${payload.landmark}, Gandhidham` : 'Gandhidham'),
    landmark: payload.landmark?.trim(),
    ward: resolvedWard,
    reportedAt: 'Just now',
    votes: 1,
    severity: payload.severity,
    department: resolvedDept,
    photoDataUrl: payload.photoDataUrl,
    photoUrl: payload.photoDataUrl,
    reportedByName: payload.isAnonymous ? 'Anonymous Citizen' : payload.reportedByName || 'Citizen',
    reportedByPhone: payload.reportedByPhone,
    reportedByEmail: payload.reportedByEmail,
    reportedByUserId: payload.reportedByUserId,
    isAnonymous: !!payload.isAnonymous,
    createdAtIso: now.toISOString(),
    slaDeadline: sla.deadlineLabel,
  };

  inMemoryReports = [newReport, ...existing];

  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryReports));
    } catch (err) {
      console.warn('Failed to persist report to localStorage:', err);
    }
  }

  // Notify memory listeners
  memoryListeners.forEach((listener) => {
    try {
      listener(newReport);
    } catch {
      // ignore
    }
  });

  // Dispatch browser DOM event if available
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newReport }));
    } catch {
      // ignore
    }
  }

  return newReport;
}

/**
 * Returns all active issues for the Live Map (combining mock issues and user-reported issues)
 */
export function getAllCivicIssues(): CivicIssue[] {
  const userReports = getStoredUserReports();
  return [...userReports, ...MOCK_ISSUES];
}

/**
 * Subscribes to new issue creation events
 */
export function subscribeToNewIssues(callback: (newReport: StoredCivicReport) => void): () => void {
  memoryListeners.add(callback);

  return () => {
    memoryListeners.delete(callback);
  };
}

/**
 * Sample civic issue reference photos for quick 1-click test fill
 */
export const SAMPLE_CIVIC_PHOTOS = [
  {
    id: 'pothole',
    label: 'Road Pothole',
    category: 'Pothole' as CivicCategory,
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    title: 'Severe crater near Rotary Circle crossing',
  },
  {
    id: 'streetlight',
    label: 'Broken Streetlight',
    category: 'Streetlight' as CivicCategory,
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    title: 'High-mast light fixture disconnected',
  },
  {
    id: 'garbage',
    label: 'Garbage Dump',
    category: 'Garbage' as CivicCategory,
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    title: 'Commercial overflow on pedestrian footpath',
  },
  {
    id: 'water',
    label: 'Water Pipeline',
    category: 'Water Leakage' as CivicCategory,
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    title: 'Underground potable water pipe burst',
  },
];
