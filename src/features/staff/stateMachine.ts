/**
 * Issue Status Transition State Machine & SLA Calculation
 * Enforces valid transition paths and prevents illegal jumps.
 */

import { IssueStatus } from './types';

/**
 * Valid status progression for municipal staff.
 * Notice: Staff cannot jump stages or unilaterally close tickets.
 */
export const VALID_STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  Reported: ['Acknowledged'],
  Acknowledged: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: [], // Terminal for staff; closed by citizen verification or admin
  Closed: [],
};

/**
 * Checks whether a requested status transition is legally permitted.
 */
export function canTransitionStatus(
  currentStatus: IssueStatus,
  targetStatus: IssueStatus
): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Returns the list of valid next status actions for a given status.
 */
export function getValidNextStatuses(currentStatus: IssueStatus): IssueStatus[] {
  return VALID_STATUS_TRANSITIONS[currentStatus] || [];
}

export interface SlaInfo {
  isOverdue: boolean;
  timeRemainingFormatted: string;
  urgency: 'critical' | 'warning' | 'normal';
  relativeTime: string;
}

/**
 * Calculates SLA progress and time remaining/overdue.
 */
export function getSlaInfo(slaDeadlineIso: string): SlaInfo {
  const now = new Date().getTime();
  const deadline = new Date(slaDeadlineIso).getTime();
  const diffMs = deadline - now;

  if (isNaN(deadline)) {
    return {
      isOverdue: false,
      timeRemainingFormatted: 'No SLA',
      urgency: 'normal',
      relativeTime: 'N/A',
    };
  }

  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

  let timeString = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    timeString = `${days}d ${remHours}h`;
  } else if (hours > 0) {
    timeString = `${hours}h ${minutes}m`;
  } else {
    timeString = `${minutes}m`;
  }

  if (isOverdue) {
    return {
      isOverdue: true,
      timeRemainingFormatted: `Overdue by ${timeString}`,
      urgency: 'critical',
      relativeTime: `${timeString} overdue`,
    };
  }

  const urgency: 'critical' | 'warning' | 'normal' =
    hours < 4 ? 'critical' : hours < 12 ? 'warning' : 'normal';

  return {
    isOverdue: false,
    timeRemainingFormatted: `${timeString} left`,
    urgency,
    relativeTime: `${timeString} remaining`,
  };
}
