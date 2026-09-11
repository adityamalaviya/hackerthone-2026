/**
 * Shared Admin State Hook
 * Contains the complete state machine, filtering engine, and simulated API operations.
 * Designed for cross-platform portability between React Web and React Native.
 * 
 * NOTE: For hackathon demo.
 * // TODO: backend must verify admin role server-side before returning unrestricted issue data
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AdminIssue,
  StaffMember,
  AuditLogEntry,
  AdminTab,
  IssueFilterState,
  AdminMetrics,
  AssignIssuePayload,
  FlagResolutionPayload,
  AddStaffPayload,
  DepartmentName,
  CivicCategory,
} from '../../types/admin';
import {
  INITIAL_MOCK_ISSUES,
  INITIAL_MOCK_STAFF,
  INITIAL_MOCK_AUDIT_LOG,
  DEPARTMENTS,
} from './mockAdminData';

const DEFAULT_FILTERS: IssueFilterState = {
  search: '',
  department: 'all',
  category: 'all',
  status: 'all',
  severity: 'all',
  dateRange: 'all',
  sortBy: 'createdDate',
  sortOrder: 'desc',
};

export function useAdminState() {
  const [issues, setIssues] = useState<AdminIssue[]>(() => INITIAL_MOCK_ISSUES);
  const [staff, setStaff] = useState<StaffMember[]>(() => INITIAL_MOCK_STAFF);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => INITIAL_MOCK_AUDIT_LOG);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [filters, setFiltersState] = useState<IssueFilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Simulated initial API fetch delay (requirement 10)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Filter setters
  const setFilters = useCallback((updates: Partial<IssueFilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Helper to log audit entries
  const logAudit = useCallback((action: string, details: string, issueId?: string) => {
    const entry: AuditLogEntry = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timestampMs: Date.now(),
      actorId: 'adm-001',
      actorName: 'Super Admin (Municipality)',
      action,
      details,
      issueId,
    };
    setAuditLog((prev) => [entry, ...prev]);
  }, []);

  /**
   * Assign or Reassign an issue to a specific department and staff member.
   * // TODO: Replace with PATCH /api/issues/:id/assign with server-side admin role check.
   */
  const assignIssue = useCallback(
    async (payload: AssignIssuePayload): Promise<boolean> => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 350));

      const { issueId, targetDepartment, targetStaffId, targetStaffName } = payload;
      let previousAssignee = 'Unassigned';

      setIssues((prevIssues) =>
        prevIssues.map((issue) => {
          if (issue.id === issueId) {
            previousAssignee = issue.assignedStaffName || 'Unassigned';
            return {
              ...issue,
              department: targetDepartment,
              assignedStaffId: targetStaffId,
              assignedStaffName: targetStaffName,
              status: issue.status === 'Reported' ? 'Acknowledged' : issue.status,
            };
          }
          return issue;
        })
      );

      // Update staff load counts
      setStaff((prevStaff) =>
        prevStaff.map((member) => {
          if (member.id === targetStaffId) {
            return { ...member, activeAssignedCount: member.activeAssignedCount + 1 };
          }
          return member;
        })
      );

      const actionType = previousAssignee === 'Unassigned' ? 'ASSIGN_ISSUE' : 'REASSIGN_ISSUE';
      const logDetails =
        previousAssignee === 'Unassigned'
          ? `Assigned ${issueId} to ${targetStaffName} (${targetDepartment})`
          : `Reassigned ${issueId} from ${previousAssignee} to ${targetStaffName} (${targetDepartment})`;

      logAudit(actionType, logDetails, issueId);
      setIsLoading(false);
      showNotification(`Successfully assigned ${issueId} to ${targetStaffName}`);
      return true;
    },
    [logAudit, showNotification]
  );

  /**
   * Review Flagged Issues: Approve (Closes issue) or Reject (Returns to active staff queue).
   * // TODO: Replace with POST /api/issues/:id/review-flag with server-side validation.
   */
  const resolveFlag = useCallback(
    async (payload: FlagResolutionPayload): Promise<boolean> => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 350));

      const { issueId, action, adminNotes } = payload;
      let issueTitle = '';

      setIssues((prevIssues) =>
        prevIssues.map((issue) => {
          if (issue.id === issueId) {
            issueTitle = issue.title;
            const newStatus = action === 'approve' ? 'Closed' : 'In Progress';
            return {
              ...issue,
              status: newStatus,
              flagged: {
                ...issue.flagged,
                isFlagged: false, // Flag is now resolved
              },
            };
          }
          return issue;
        })
      );

      const actionName = action === 'approve' ? 'APPROVE_FLAG_CLOSED' : 'REJECT_FLAG_RETURNED';
      const detailMsg =
        action === 'approve'
          ? `Approved flag for ${issueId} (${issueTitle}). Issue closed permanently.` +
            (adminNotes ? ` Note: ${adminNotes}` : '')
          : `Rejected flag for ${issueId} (${issueTitle}). Returned to staff active queue.` +
            (adminNotes ? ` Note: ${adminNotes}` : '');

      logAudit(actionName, detailMsg, issueId);
      setIsLoading(false);
      showNotification(
        action === 'approve'
          ? `Flag approved: ${issueId} is now marked Closed.`
          : `Flag rejected: ${issueId} returned to active staff queue.`
      );
      return true;
    },
    [logAudit, showNotification]
  );

  /**
   * Add a new staff member (mock only for hackathon demo).
   * // TODO: backend handles real account creation
   */
  const addStaff = useCallback(
    async (payload: AddStaffPayload): Promise<boolean> => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 350));

      const newStaffId = 'stf-' + Math.random().toString(36).substring(2, 6);
      const newStaffMember: StaffMember = {
        id: newStaffId,
        name: payload.name,
        email: payload.email,
        department: payload.department,
        status: 'active',
        activeAssignedCount: 0,
        phone: payload.phone || '+91 98251 ' + Math.floor(10000 + Math.random() * 90000),
      };

      setStaff((prev) => [newStaffMember, ...prev]);
      logAudit('ADD_STAFF', `Added staff member ${payload.name} to ${payload.department}`);
      setIsLoading(false);
      showNotification(`Added staff member ${payload.name} (${payload.department})`);
      return true;
    },
    [logAudit, showNotification]
  );

  /**
   * Toggle staff status (active / disabled).
   * // TODO: Replace with PATCH /api/staff/:id/status
   */
  const toggleStaffStatus = useCallback(
    async (staffId: string): Promise<void> => {
      setStaff((prevStaff) =>
        prevStaff.map((member) => {
          if (member.id === staffId) {
            const nextStatus = member.status === 'active' ? 'disabled' : 'active';
            logAudit(
              'TOGGLE_STAFF_STATUS',
              `Changed status of ${member.name} (${member.department}) to ${nextStatus}`
            );
            showNotification(`Updated ${member.name} status to ${nextStatus}`);
            return { ...member, status: nextStatus };
          }
          return member;
        })
      );
    },
    [logAudit, showNotification]
  );

  /**
   * Update department assignment for staff.
   * // TODO: Replace with PATCH /api/staff/:id/department
   */
  const updateStaffDepartment = useCallback(
    async (staffId: string, department: DepartmentName): Promise<void> => {
      setStaff((prevStaff) =>
        prevStaff.map((member) => {
          if (member.id === staffId) {
            logAudit(
              'UPDATE_STAFF_DEPARTMENT',
              `Transferred ${member.name} from ${member.department} to ${department}`
            );
            showNotification(`Updated ${member.name}'s department to ${department}`);
            return { ...member, department };
          }
          return member;
        })
      );
    },
    [logAudit, showNotification]
  );

  // Derived: Filtered Issues list
  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        // Search filter
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchId = issue.id.toLowerCase().includes(q);
          const matchTitle = issue.title.toLowerCase().includes(q);
          const matchLocation = issue.locationName.toLowerCase().includes(q);
          const matchStaff = issue.assignedStaffName?.toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchLocation && !matchStaff) {
            return false;
          }
        }

        // Department filter
        if (filters.department !== 'all' && issue.department !== filters.department) {
          return false;
        }

        // Category filter
        if (filters.category !== 'all' && issue.category !== filters.category) {
          return false;
        }

        // Status filter
        if (filters.status !== 'all' && issue.status !== filters.status) {
          return false;
        }

        // Severity filter
        if (filters.severity !== 'all' && issue.severity !== filters.severity) {
          return false;
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
          const now = Date.now();
          const diffMs = now - issue.createdAtTimestamp;
          if (filters.dateRange === 'today' && diffMs > 24 * 60 * 60 * 1000) {
            return false;
          }
          if (filters.dateRange === 'last7days' && diffMs > 7 * 24 * 60 * 60 * 1000) {
            return false;
          }
          if (filters.dateRange === 'last30days' && diffMs > 30 * 24 * 60 * 60 * 1000) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (filters.sortBy === 'createdDate') {
          compare = b.createdAtTimestamp - a.createdAtTimestamp;
        } else if (filters.sortBy === 'slaDeadline') {
          compare = a.slaDeadlineTimestamp - b.slaDeadlineTimestamp;
        } else if (filters.sortBy === 'severity') {
          const weight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          compare = (weight[b.severity] || 0) - (weight[a.severity] || 0);
        } else if (filters.sortBy === 'status') {
          compare = a.status.localeCompare(b.status);
        }
        return filters.sortOrder === 'asc' ? -compare : compare;
      });
  }, [issues, filters]);

  // Derived: Flagged issues pending admin review
  const flaggedIssues = useMemo(() => {
    return issues.filter((issue) => issue.flagged && issue.flagged.isFlagged);
  }, [issues]);

  // Derived: Escalation queue (SLA breached or staff escalated)
  const escalatedIssues = useMemo(() => {
    return issues.filter((issue) => issue.isSlaBreached || issue.isEscalated);
  }, [issues]);

  // Derived: Summary Metrics for Overview Dashboard
  const metrics: AdminMetrics = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter(
      (i) => i.status === 'Resolved' || i.status === 'Closed'
    ).length;
    const unresolved = total - resolved;
    const escalated = issues.filter((i) => i.isSlaBreached || i.isEscalated).length;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    issues.forEach((i) => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    });

    const categories: CivicCategory[] = [
      'Pothole',
      'Streetlight',
      'Garbage',
      'Water Leakage',
      'Drainage',
      'Other',
    ];

    const categoryDistribution = categories.map((cat) => {
      const count = categoryCounts[cat] || 0;
      return {
        category: cat,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    // Department distribution
    const departmentDistribution = DEPARTMENTS.map((dept) => {
      const deptIssues = issues.filter((i) => i.department === dept);
      const pendingCount = deptIssues.filter(
        (i) => i.status !== 'Resolved' && i.status !== 'Closed'
      ).length;
      return {
        department: dept,
        count: deptIssues.length,
        pendingCount,
      };
    });

    // Mock resolution turnaround trend (last 7 days)
    const resolutionTrend = [
      { day: 'Mon', resolved: 14, avgHours: 18.2 },
      { day: 'Tue', resolved: 19, avgHours: 16.5 },
      { day: 'Wed', resolved: 22, avgHours: 14.8 },
      { day: 'Thu', resolved: 16, avgHours: 15.2 },
      { day: 'Fri', resolved: 25, avgHours: 12.4 },
      { day: 'Sat', resolved: 21, avgHours: 13.9 },
      { day: 'Sun', resolved: 12, avgHours: 19.1 },
    ];

    return {
      totalIssues: total,
      resolvedCount: resolved,
      unresolvedCount: unresolved,
      escalatedCount: escalated,
      categoryDistribution,
      departmentDistribution,
      resolutionTrend,
    };
  }, [issues]);

  return {
    issues,
    filteredIssues,
    flaggedIssues,
    escalatedIssues,
    staff,
    auditLog,
    activeTab,
    filters,
    isLoading,
    notification,
    metrics,
    departments: DEPARTMENTS,
    setActiveTab,
    setFilters,
    resetFilters,
    assignIssue,
    resolveFlag,
    addStaff,
    toggleStaffStatus,
    updateStaffDepartment,
  };
}
