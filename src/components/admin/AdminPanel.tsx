import React, { useState } from 'react';
import {
  ChartPieSlice,
  ListBullets,
  Flag,
  WarningOctagon,
  Users,
  Scroll,
  SignOut,
  CheckCircle,
} from '@phosphor-icons/react';
import { useAdminState } from '../../lib/admin/useAdminState';
import { AdminIssue } from '../../types/admin';
import { exportIssuesToCsv } from '../../lib/admin/exportCsv';
import { UserSession } from '../../lib/appwrite';

import { AdminOverview } from './AdminOverview';
import { AllIssuesView } from './AllIssuesView';
import { ReviewFlaggedView } from './ReviewFlaggedView';
import { EscalationQueueView } from './EscalationQueueView';
import { StaffManagementView } from './StaffManagementView';
import { AuditLogView } from './AuditLogView';
import { AssignModal } from './AssignModal';
import { LoadingSkeleton } from './LoadingSkeleton';

interface AdminPanelProps {
  currentUser?: UserSession | null;
  onLogout?: () => void;
  onSwitchToCitizenView?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onLogout,
  onSwitchToCitizenView,
}) => {
  const {
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
    departments,
    setActiveTab,
    setFilters,
    resetFilters,
    assignIssue,
    resolveFlag,
    addStaff,
    toggleStaffStatus,
    updateStaffDepartment,
  } = useAdminState();

  // State for Assign/Reassign Modal
  const [selectedIssueForAssign, setSelectedIssueForAssign] = useState<AdminIssue | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleOpenAssign = (issue: AdminIssue) => {
    setSelectedIssueForAssign(issue);
    setIsAssignModalOpen(true);
  };

  const handleCloseAssign = () => {
    setSelectedIssueForAssign(null);
    setIsAssignModalOpen(false);
  };

  const handleExportCsv = () => {
    exportIssuesToCsv(filteredIssues);
  };

  return (
    <div className="min-h-screen bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100 flex flex-col font-sans transition-colors duration-200">
      {/* Main Admin Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-civic-900/95 backdrop-blur-md border-b border-civic-200 dark:border-civic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-civic-950 dark:text-white">
                civicFix
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-civic-100 dark:bg-civic-800 text-civic-700 dark:text-civic-300 border border-civic-200 dark:border-civic-700">
                Admin Panel
              </span>
            </div>
          </div>

          {/* User profile identifier & Controls */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-semibold text-civic-900 dark:text-civic-100">
                {currentUser?.name || 'Super Admin (Municipality)'}
              </span>
              <span className="text-2xs text-civic-500">
                Gandhidham Municipal Corporation
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-civic-900 text-white dark:bg-white dark:text-civic-900 flex items-center justify-center font-bold text-xs shadow-sm">
              AD
            </div>

            {onSwitchToCitizenView && (
              <button
                type="button"
                onClick={onSwitchToCitizenView}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-civic-700 dark:text-civic-300 hover:bg-civic-100 dark:hover:bg-civic-800 border border-civic-200 dark:border-civic-700 transition-colors cursor-pointer"
              >
                <span>Citizen View</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <SignOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-civic-100 dark:border-civic-800/60 py-1.5">
          {/* Tab 1: Overview */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-civic-900 text-white dark:bg-white dark:text-civic-950 shadow-sm'
                : 'text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-white hover:bg-civic-100 dark:hover:bg-civic-800'
            }`}
          >
            <ChartPieSlice size={15} weight={activeTab === 'overview' ? 'fill' : 'regular'} />
            <span>Dashboard Overview</span>
          </button>

          {/* Tab 2: All Issues */}
          <button
            type="button"
            onClick={() => setActiveTab('all-issues')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all-issues'
                ? 'bg-civic-900 text-white dark:bg-white dark:text-civic-950 shadow-sm'
                : 'text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-white hover:bg-civic-100 dark:hover:bg-civic-800'
            }`}
          >
            <ListBullets size={15} weight={activeTab === 'all-issues' ? 'bold' : 'regular'} />
            <span>All Issues</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-3xs font-bold ${
                activeTab === 'all-issues'
                  ? 'bg-white/20 text-white dark:bg-civic-900/20 dark:text-civic-950'
                  : 'bg-civic-200 dark:bg-civic-800 text-civic-700 dark:text-civic-300'
              }`}
            >
              {issues.length}
            </span>
          </button>

          {/* Tab 3: Pending Review (Flagged) */}
          <button
            type="button"
            onClick={() => setActiveTab('pending-review')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'pending-review'
                ? 'bg-civic-900 text-white dark:bg-white dark:text-civic-950 shadow-sm'
                : 'text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-white hover:bg-civic-100 dark:hover:bg-civic-800'
            }`}
          >
            <Flag size={15} weight={activeTab === 'pending-review' ? 'fill' : 'regular'} />
            <span>Pending Review</span>
            {flaggedIssues.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-3xs font-bold bg-amber-500 text-white">
                {flaggedIssues.length}
              </span>
            )}
          </button>

          {/* Tab 4: Escalation Queue */}
          <button
            type="button"
            onClick={() => setActiveTab('escalations')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'escalations'
                ? 'bg-civic-900 text-white dark:bg-white dark:text-civic-950 shadow-sm'
                : 'text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-white hover:bg-civic-100 dark:hover:bg-civic-800'
            }`}
          >
            <WarningOctagon size={15} weight={activeTab === 'escalations' ? 'fill' : 'regular'} />
            <span>Escalations</span>
            {escalatedIssues.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-3xs font-bold bg-red-600 text-white">
                {escalatedIssues.length}
              </span>
            )}
          </button>

          {/* Tab 5: Staff Management */}
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-civic-900 text-white dark:bg-white dark:text-civic-950 shadow-sm'
                : 'text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-white hover:bg-civic-100 dark:hover:bg-civic-800'
            }`}
          >
            <Users size={15} weight={activeTab === 'staff' ? 'fill' : 'regular'} />
            <span>Staff Directory</span>
          </button>

          {/* Tab 6: Audit Log */}
          <button
            type="button"
            onClick={() => setActiveTab('audit-log')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'audit-log'
                ? 'bg-civic-900 text-white dark:bg-white dark:text-civic-950 shadow-sm'
                : 'text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-white hover:bg-civic-100 dark:hover:bg-civic-800'
            }`}
          >
            <Scroll size={15} weight={activeTab === 'audit-log' ? 'fill' : 'regular'} />
            <span>Audit Log</span>
          </button>
        </div>
      </header>

      {/* Action Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-civic-900 text-white dark:bg-white dark:text-civic-950 shadow-2xl border border-civic-700 dark:border-civic-200 text-xs font-medium animate-in slide-in-from-bottom-5">
          <CheckCircle size={18} weight="fill" className="text-emerald-400 dark:text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {isLoading ? (
          <LoadingSkeleton type={activeTab === 'overview' ? 'full' : 'table'} />
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverview metrics={metrics} onNavigateTab={setActiveTab} />
            )}

            {activeTab === 'all-issues' && (
              <AllIssuesView
                issues={filteredIssues}
                totalCount={issues.length}
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={resetFilters}
                onOpenAssign={handleOpenAssign}
                onExportCsv={handleExportCsv}
              />
            )}

            {activeTab === 'pending-review' && (
              <ReviewFlaggedView
                flaggedIssues={flaggedIssues}
                onResolveFlag={resolveFlag}
              />
            )}

            {activeTab === 'escalations' && (
              <EscalationQueueView
                escalatedIssues={escalatedIssues}
                onOpenAssign={handleOpenAssign}
              />
            )}

            {activeTab === 'staff' && (
              <StaffManagementView
                staffList={staff}
                departments={departments}
                onAddStaff={addStaff}
                onToggleStatus={toggleStaffStatus}
                onUpdateDepartment={updateStaffDepartment}
              />
            )}

            {activeTab === 'audit-log' && (
              <AuditLogView auditLog={auditLog} />
            )}
          </>
        )}
      </main>

      {/* Assign / Reassign Modal Dialog */}
      <AssignModal
        isOpen={isAssignModalOpen}
        issue={selectedIssueForAssign}
        staffList={staff}
        departments={departments}
        onClose={handleCloseAssign}
        onConfirmAssign={assignIssue}
      />
    </div>
  );
};
