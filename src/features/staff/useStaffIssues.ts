/**
 * Shared Headless Hook: useStaffIssues
 * Encapsulates department scoping, state machine transitions, remarks,
 * flagging, escalation, and notification simulation.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StaffIssue,
  StaffDepartment,
  IssueStatus,
  IssueSeverity,
  IssueResolution,
  InternalRemark,
  StaffFilterOptions,
} from './types';
import { INITIAL_MOCK_STAFF_ISSUES } from './mockStaffIssues';
import { canTransitionStatus } from './stateMachine';

export interface StaffNotification {
  id: string;
  issueId: string;
  category: string;
  shortDescription: string;
  timestamp: string;
}

export function useStaffIssues(
  staffDepartment: StaffDepartment,
  staffId: string = 'STF-402',
  staffName: string = 'Ward Officer (Gandhidham MC)'
) {
  const [allIssues, setAllIssues] = useState<StaffIssue[]>(() => {
    const saved = localStorage.getItem('civicfix_mock_staff_issues');
    if (saved) {
      try {
        return JSON.parse(saved) as StaffIssue[];
      } catch {
        return INITIAL_MOCK_STAFF_ISSUES;
      }
    }
    return INITIAL_MOCK_STAFF_ISSUES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeToast, setActiveToast] = useState<StaffNotification | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Filter options state
  const [filters, setFilters] = useState<StaffFilterOptions>({
    searchQuery: '',
    status: 'All',
    severity: 'All',
    sortBy: 'sla',
  });

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem('civicfix_mock_staff_issues', JSON.stringify(allIssues));
  }, [allIssues]);

  // Simulate initial API fetch loading latency
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [staffDepartment]);

  /**
   * Access Restriction Requirement:
   * Staff must never see issues outside their own department, even in mock data.
   * // TODO: backend must enforce department-scoping server-side, not just hide in UI
   */
  const departmentIssues = useMemo(() => {
    // TODO: backend must enforce department-scoping server-side, not just hide in UI
    return allIssues.filter((issue) => issue.department === staffDepartment);
  }, [allIssues, staffDepartment]);

  // Filtered & Sorted issues for the UI queue
  const filteredIssues = useMemo(() => {
    let result = [...departmentIssues];

    // Search query filter
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.shortDescription.toLowerCase().includes(q) ||
          i.locationName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'All') {
      result = result.filter((i) => i.status === filters.status);
    }

    // Severity filter
    if (filters.severity && filters.severity !== 'All') {
      result = result.filter((i) => i.severity === filters.severity);
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'sla') {
        return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
      }
      if (filters.sortBy === 'assignedDate') {
        return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      }
      if (filters.sortBy === 'severity') {
        const priority: Record<IssueSeverity, number> = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };
        return priority[b.severity] - priority[a.severity];
      }
      return 0;
    });

    return result;
  }, [departmentIssues, filters]);

  /**
   * Update Issue Status through valid transitions only.
   */
  const updateStatus = useCallback(
    (issueId: string, newStatus: IssueStatus, resolutionData?: IssueResolution): { success: boolean; error?: string } => {
      const issue = allIssues.find((i) => i.id === issueId);
      if (!issue) {
        return { success: false, error: 'Issue not found' };
      }

      // Check transition legitimacy
      if (!canTransitionStatus(issue.status, newStatus)) {
        return {
          success: false,
          error: `Illegal status transition from "${issue.status}" to "${newStatus}".`,
        };
      }

      // If resolving, verify proof photo and resolution notes
      if (newStatus === 'Resolved') {
        if (!resolutionData?.proofPhotoUrl || !resolutionData?.notes?.trim()) {
          return {
            success: false,
            error: 'Resolution proof photo and resolution notes are strictly required.',
          };
        }
      }

      const updatedIssues = allIssues.map((item) => {
        if (item.id !== issueId) return item;

        const auditRemark: InternalRemark = {
          id: `audit-${Date.now()}`,
          staffId,
          staffName,
          text: `Status changed from "${item.status}" to "${newStatus}"${
            resolutionData ? `: ${resolutionData.notes}` : ''
          }`,
          timestamp: new Date().toISOString(),
        };

        return {
          ...item,
          status: newStatus,
          resolution: resolutionData || item.resolution,
          internalRemarks: [...item.internalRemarks, auditRemark],
        };
      });

      setAllIssues(updatedIssues);
      return { success: true };
    },
    [allIssues, staffId, staffName]
  );

  /**
   * Add Internal Remark on an Issue.
   */
  const addInternalRemark = useCallback(
    (issueId: string, text: string): boolean => {
      const cleanText = text.trim();
      if (!cleanText) return false;

      const newRemark: InternalRemark = {
        id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        staffId,
        staffName,
        text: cleanText,
        timestamp: new Date().toISOString(),
      };

      setAllIssues((prev) =>
        prev.map((item) => {
          if (item.id !== issueId) return item;
          return {
            ...item,
            internalRemarks: [...item.internalRemarks, newRemark],
          };
        })
      );
      return true;
    },
    [staffId, staffName]
  );

  /**
   * Flag issue as Duplicate or Invalid.
   * Requirement: Flagged issues show "Pending Admin Review" badge.
   * Do NOT remove them from the list or mark as closed (staff cannot unilaterally close).
   */
  const flagIssue = useCallback(
    (issueId: string, reason: string): boolean => {
      const cleanReason = reason.trim();
      if (!cleanReason) return false;

      const timestamp = new Date().toISOString();

      setAllIssues((prev) =>
        prev.map((item) => {
          if (item.id !== issueId) return item;
          return {
            ...item,
            flag: {
              isFlagged: true,
              reason: cleanReason,
              flaggedAt: timestamp,
              flaggedByStaffId: staffId,
              flaggedByStaffName: staffName,
            },
            internalRemarks: [
              ...item.internalRemarks,
              {
                id: `flag-audit-${Date.now()}`,
                staffId,
                staffName,
                text: `[FLAGGED FOR ADMIN REVIEW]: ${cleanReason}`,
                timestamp,
              },
            ],
          };
        })
      );
      return true;
    },
    [staffId, staffName]
  );

  /**
   * Request Escalation for an Issue.
   */
  const escalateIssue = useCallback(
    (issueId: string, note?: string): boolean => {
      const timestamp = new Date().toISOString();

      setAllIssues((prev) =>
        prev.map((item) => {
          if (item.id !== issueId) return item;
          return {
            ...item,
            escalation: {
              isEscalated: true,
              note: note?.trim() || 'Urgent supervisor intervention required.',
              escalatedAt: timestamp,
              escalatedByStaffId: staffId,
            },
            internalRemarks: [
              ...item.internalRemarks,
              {
                id: `esc-audit-${Date.now()}`,
                staffId,
                staffName,
                text: `[ESCALATION REQUESTED]: ${note?.trim() || 'Urgent intervention requested.'}`,
                timestamp,
              },
            ],
          };
        })
      );
      return true;
    },
    [staffId, staffName]
  );

  /**
   * Simulate Incoming Issue Notification (Demo trigger).
   */
  const simulateIncomingIssue = useCallback(() => {
    const randomIdNumber = Math.floor(100 + Math.random() * 900);
    const newIssueId = `CF-2026-${randomIdNumber}`;

    const newIssue: StaffIssue = {
      id: newIssueId,
      category: staffDepartment === 'Electrical & Lighting' ? 'Streetlight' : staffDepartment === 'Sanitation & Waste' ? 'Garbage' : staffDepartment === 'Water & Sewage' ? 'Water Leakage' : 'Pothole',
      department: staffDepartment,
      severity: 'Critical',
      shortDescription: `Urgent emergency report near Gandhidham Sector ${Math.floor(1 + Math.random() * 8)}`,
      citizenDescription: 'Urgent public hazard reported by citizen via app with high priority rating.',
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      locationName: `Sector ${Math.floor(1 + Math.random() * 8)}, Main Commercial Lane`,
      ward: 'Ward 4 (Central)',
      latitude: 23.078 + Math.random() * 0.01,
      longitude: 70.13 + Math.random() * 0.01,
      assignedDate: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      status: 'Reported',
      internalRemarks: [],
    };

    setAllIssues((prev) => [newIssue, ...prev]);

    const notification: StaffNotification = {
      id: `notif-${Date.now()}`,
      issueId: newIssueId,
      category: newIssue.category,
      shortDescription: newIssue.shortDescription,
      timestamp: 'Just now',
    };

    setActiveToast(notification);
    setUnreadCount((c) => c + 1);
  }, [staffDepartment]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    departmentIssues,
    filteredIssues,
    isLoading,
    filters,
    setFilters,
    updateStatus,
    addInternalRemark,
    flagIssue,
    escalateIssue,
    activeToast,
    dismissToast,
    unreadCount,
    clearUnreadCount,
    simulateIncomingIssue,
  };
}
