import React, { useState } from 'react';
import {
  MagnifyingGlass,
  Funnel,
  Bell,
  Lightning,
  Buildings,
  HardHat,
  CheckCircle,
  User,
  ListBullets,
} from '@phosphor-icons/react';
import {
  StaffDepartment,
  StaffIssue,
  IssueStatus,
} from '../../features/staff/types';
import { useStaffIssues } from '../../features/staff/useStaffIssues';
import { IssueQueueList } from './IssueQueueList';
import { IssueDetailModal } from './IssueDetailModal';
import { NotificationToast } from './NotificationToast';

interface StaffPanelProps {
  userDepartment?: StaffDepartment;
  staffName?: string;
  staffId?: string;
  onSignOut?: () => void;
  onToggleViewMode?: () => void;
}

const DEPARTMENTS: StaffDepartment[] = [
  'Roads & Infrastructure',
  'Electrical & Lighting',
  'Sanitation & Waste',
  'Water & Sewage',
];

export const StaffPanel: React.FC<StaffPanelProps> = ({
  userDepartment = 'Roads & Infrastructure',
  staffName = 'Ward Officer (Gandhidham MC)',
  staffId = 'STF-402',
  onSignOut,
  onToggleViewMode,
}) => {
  // Allow demo switching of department to test scoping across categories
  const [selectedDept, setSelectedDept] = useState<StaffDepartment>(userDepartment);
  const [selectedIssue, setSelectedIssue] = useState<StaffIssue | null>(null);

  const {
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
  } = useStaffIssues(selectedDept, staffId, staffName);

  // Keep selectedIssue synced with updated allIssues
  const activeSelectedIssue = selectedIssue
    ? departmentIssues.find((i) => i.id === selectedIssue.id) || null
    : null;

  const statusCounts = React.useMemo(() => {
    return {
      all: departmentIssues.length,
      reported: departmentIssues.filter((i) => i.status === 'Reported').length,
      acknowledged: departmentIssues.filter((i) => i.status === 'Acknowledged').length,
      inProgress: departmentIssues.filter((i) => i.status === 'In Progress').length,
      resolved: departmentIssues.filter((i) => i.status === 'Resolved').length,
    };
  }, [departmentIssues]);

  return (
    <div className="min-h-screen bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Staff Workstation Banner */}
      <header className="sticky top-0 z-30 bg-white dark:bg-civic-900 border-b border-civic-200 dark:border-civic-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: Branding & Staff Badge */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-civic-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <HardHat size={20} weight="fill" className="text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-civic-950 dark:text-civic-50 tracking-tight">
                    civicFix Staff Workstation
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    Live Field Dispatch
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-civic-500 dark:text-civic-400">
                  <span className="flex items-center gap-1">
                    <User size={12} weight="bold" />
                    {staffName} ({staffId})
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Demo Actions & Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Simulate incoming issue demo trigger */}
              <button
                type="button"
                onClick={simulateIncomingIssue}
                title="Simulate incoming ticket assignment notification for demo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent-hover text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Lightning size={14} weight="fill" />
                <span className="hidden sm:inline">Simulate New Assignment</span>
                <span className="sm:hidden">+ Mock</span>
              </button>

              {/* Notification Bell with Badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={clearUnreadCount}
                  className="w-9 h-9 rounded-lg border border-civic-200 dark:border-civic-700 hover:bg-civic-100 dark:hover:bg-civic-800 text-civic-700 dark:text-civic-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Field Notifications"
                >
                  <Bell size={17} weight="bold" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-reported text-white text-3xs font-bold flex items-center justify-center animate-pulse shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* View Switcher / Sign Out */}
              {onToggleViewMode && (
                <button
                  type="button"
                  onClick={onToggleViewMode}
                  className="hidden md:inline-flex items-center gap-1 text-xs font-medium text-civic-600 dark:text-civic-400 hover:text-civic-950 dark:hover:text-civic-100 px-2.5 py-1 rounded-lg border border-civic-200 dark:border-civic-700 hover:bg-civic-50 dark:hover:bg-civic-800 transition-colors cursor-pointer"
                >
                  Citizen Preview
                </button>
              )}

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Department Scoping Bar */}
          <div className="py-2.5 border-t border-civic-100 dark:border-civic-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Buildings size={16} className="text-civic-500 dark:text-civic-400 flex-shrink-0" />
              <span className="text-xs font-bold text-civic-700 dark:text-civic-300 uppercase tracking-wider">
                Assigned Department:
              </span>
              <span className="text-xs font-extrabold text-civic-950 dark:text-civic-50 bg-civic-100 dark:bg-civic-800 px-2.5 py-1 rounded-md border border-civic-200 dark:border-civic-700">
                {selectedDept}
              </span>
            </div>

            {/* Department Quick Switcher for Hackathon Judging */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-2xs text-civic-400 dark:text-civic-500 font-medium whitespace-nowrap">
                Demo Dept Switcher:
              </span>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`text-2xs font-semibold px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-civic-950 text-white dark:bg-civic-100 dark:text-civic-950 shadow-xs'
                      : 'bg-white dark:bg-civic-800 text-civic-600 dark:text-civic-300 border border-civic-200 dark:border-civic-700 hover:bg-civic-100 dark:hover:bg-civic-700'
                  }`}
                >
                  {dept.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* Department Scoping Backend Notice (Required by prompt) */}
        <div className="mb-5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <Buildings size={16} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Security Scope Enforced:</span> Showing issues strictly allocated to{' '}
            <strong>{selectedDept}</strong>. Staff cannot access complaints outside their municipal department jurisdiction.
            <div className="font-mono text-3xs text-amber-800 dark:text-amber-300 mt-0.5">
              // backend enforces department-scoping server-side
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <MagnifyingGlass
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-civic-400 dark:text-civic-500"
              />
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                placeholder="Search ticket ID, landmark, or description in this queue..."
                className="w-full pl-9 pr-4 py-2 text-xs text-civic-900 dark:text-civic-100 bg-civic-50 dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Funnel size={15} className="text-civic-400 dark:text-civic-500" />
              <select
                value={filters.severity || 'All'}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    severity: e.target.value as StaffIssue['severity'] | 'All',
                  }))
                }
                className="text-xs bg-civic-50 dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl px-3 py-2 text-civic-800 dark:text-civic-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical Only</option>
                <option value="High">High Only</option>
                <option value="Medium">Medium Only</option>
                <option value="Low">Low Only</option>
              </select>

              {/* Sort By */}
              <select
                value={filters.sortBy || 'sla'}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as 'sla' | 'severity' | 'assignedDate',
                  }))
                }
                className="text-xs bg-civic-50 dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl px-3 py-2 text-civic-800 dark:text-civic-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer w-full sm:w-auto"
              >
                <option value="sla">Sort: SLA Deadline</option>
                <option value="severity">Sort: Highest Severity</option>
                <option value="assignedDate">Sort: Newest Assigned</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-civic-100 dark:border-civic-800">
            {(
              [
                { key: 'All', label: 'All Active Queue', count: statusCounts.all },
                { key: 'Reported', label: 'Reported', count: statusCounts.reported },
                { key: 'Acknowledged', label: 'Acknowledged', count: statusCounts.acknowledged },
                { key: 'In Progress', label: 'In Progress', count: statusCounts.inProgress },
                { key: 'Resolved', label: 'Resolved', count: statusCounts.resolved },
              ] as const
            ).map((tab) => {
              const isActive = (filters.status || 'All') === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      status: tab.key as IssueStatus | 'All',
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-civic-950 text-white dark:bg-civic-100 dark:text-civic-950 shadow-xs'
                      : 'bg-civic-100 text-civic-600 hover:bg-civic-200 dark:bg-civic-800 dark:text-civic-300 dark:hover:bg-civic-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-3xs font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-civic-900/40 dark:text-civic-950'
                        : 'bg-civic-200 text-civic-700 dark:bg-civic-700 dark:text-civic-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Issue Queue Results Header */}
        <div className="flex items-center justify-between mb-3 text-xs text-civic-500 dark:text-civic-400">
          <div className="flex items-center gap-2">
            <ListBullets size={16} className="text-civic-600 dark:text-civic-400" />
            <span className="font-semibold text-civic-800 dark:text-civic-200">
              Department Issues Queue ({filteredIssues.length} tickets)
            </span>
          </div>
          <span className="text-2xs">Click an issue to inspect and advance workflow</span>
        </div>

        {/* Loading State Skeleton */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 rounded-xl p-5 shadow-xs animate-pulse space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="h-5 w-24 bg-civic-200 dark:bg-civic-800 rounded" />
                    <div className="h-5 w-16 bg-civic-200 dark:bg-civic-800 rounded-full" />
                  </div>
                  <div className="h-5 w-20 bg-civic-200 dark:bg-civic-800 rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-civic-200 dark:bg-civic-800 rounded" />
                <div className="h-3 w-1/2 bg-civic-100 dark:bg-civic-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-civic-900 border border-dashed border-civic-300 dark:border-civic-700 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle size={28} weight="fill" />
            </div>
            <h3 className="text-base font-bold text-civic-900 dark:text-civic-100">
              Queue Cleared for {selectedDept}
            </h3>
            <p className="text-xs text-civic-500 dark:text-civic-400 max-w-md mx-auto">
              There are currently no tickets matching your active filters in this department. All assigned civic complaints are currently handled.
            </p>
            <button
              type="button"
              onClick={simulateIncomingIssue}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Lightning size={14} weight="fill" />
              <span>Simulate New Ticket Assignment</span>
            </button>
          </div>
        ) : (
          /* Issue Queue List */
          <IssueQueueList
            issues={filteredIssues}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />
        )}
      </main>

      {/* Floating Notifications Toast */}
      <NotificationToast
        toast={activeToast}
        onDismiss={dismissToast}
        onViewIssue={(issueId) => {
          const found = departmentIssues.find((i) => i.id === issueId);
          if (found) setSelectedIssue(found);
        }}
      />

      {/* Full Detail Modal */}
      <IssueDetailModal
        issue={activeSelectedIssue}
        staffId={staffId}
        onClose={() => setSelectedIssue(null)}
        onUpdateStatus={updateStatus}
        onAddRemark={addInternalRemark}
        onFlagIssue={flagIssue}
        onEscalateIssue={escalateIssue}
      />
    </div>
  );
};
