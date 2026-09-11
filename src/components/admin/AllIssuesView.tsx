import React from 'react';
import {
  MagnifyingGlass,
  Funnel,
  ArrowClockwise,
  DownloadSimple,
  UserPlus,
  ArrowsClockwise,
  WarningCircle,
  CaretUp,
  CaretDown,
} from '@phosphor-icons/react';
import {
  AdminIssue,
  IssueFilterState,
  CivicCategory,
  SeverityLevel,
  IssueStatus,
} from '../../types/admin';
import { DEPARTMENTS } from '../../lib/admin/mockAdminData';
import { EmptyState } from './EmptyState';

interface AllIssuesViewProps {
  issues: AdminIssue[];
  totalCount: number;
  filters: IssueFilterState;
  onFilterChange: (updates: Partial<IssueFilterState>) => void;
  onResetFilters: () => void;
  onOpenAssign: (issue: AdminIssue) => void;
  onExportCsv: () => void;
}

const CATEGORIES: CivicCategory[] = [
  'Pothole',
  'Streetlight',
  'Garbage',
  'Water Leakage',
  'Drainage',
  'Other',
];

const SEVERITIES: SeverityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: IssueStatus[] = ['Reported', 'Acknowledged', 'In Progress', 'Resolved', 'Closed'];

const SEVERITY_BADGES: Record<SeverityLevel, string> = {
  Low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  High: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
  Critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 font-bold animate-pulse',
};

const STATUS_BADGES: Record<IssueStatus, string> = {
  Reported: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  Acknowledged: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  Closed: 'bg-civic-100 text-civic-700 border-civic-200 dark:bg-civic-800 dark:text-civic-300 dark:border-civic-700',
};

export const AllIssuesView: React.FC<AllIssuesViewProps> = ({
  issues,
  totalCount,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenAssign,
  onExportCsv,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.department !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.severity !== 'all' ||
    filters.dateRange !== 'all';

  const handleSort = (column: IssueFilterState['sortBy']) => {
    if (filters.sortBy === column) {
      onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      onFilterChange({ sortBy: column, sortOrder: 'desc' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-civic-950 dark:text-civic-50 tracking-tight">
              All Issues (System-Wide)
            </h2>
            <p className="text-xs text-civic-500 dark:text-civic-400">
              Showing {issues.length} of {totalCount} total logged reports across all departments.
            </p>
          </div>

          {/* Export Action */}
          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-civic-600 dark:text-civic-300 hover:text-civic-900 dark:hover:text-white bg-civic-100 dark:bg-civic-800 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowClockwise size={14} />
                <span>Reset Filters</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExportCsv}
              disabled={issues.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-civic-900 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <DownloadSimple size={15} weight="bold" />
              <span>Export CSV ({issues.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-400"
            />
            <input
              type="text"
              placeholder="Search by ID, title, area..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-civic-50 dark:bg-civic-800/80 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-900 dark:text-civic-100 placeholder-civic-400 focus:outline-none focus:ring-1 focus:ring-civic-400"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ department: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-civic-50 dark:bg-civic-800/80 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-civic-400 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-civic-50 dark:bg-civic-800/80 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-civic-400 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={filters.severity}
              onChange={(e) => onFilterChange({ severity: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-civic-50 dark:bg-civic-800/80 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-civic-400 cursor-pointer"
            >
              <option value="all">All Severities</option>
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-civic-50 dark:bg-civic-800/80 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-900 dark:text-civic-100 focus:outline-none focus:ring-1 focus:ring-civic-400 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table Container */}
      {issues.length === 0 ? (
        <EmptyState
          title="No issues match your filter criteria"
          description="Try adjusting your department, category, severity, or search keyword."
          icon={<Funnel size={24} weight="duotone" />}
          action={{
            label: 'Reset All Filters',
            onClick: onResetFilters,
          }}
        />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-civic-50/75 dark:bg-civic-800/60 border-b border-civic-200 dark:border-civic-800 text-civic-600 dark:text-civic-400 font-semibold select-none">
                  <th
                    onClick={() => handleSort('createdDate')}
                    className="py-3 px-4 cursor-pointer hover:text-civic-950 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Issue ID</span>
                      {filters.sortBy === 'createdDate' && (
                        filters.sortOrder === 'asc' ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4">Title & Ward</th>
                  <th className="py-3 px-4">Category</th>
                  <th
                    onClick={() => handleSort('severity')}
                    className="py-3 px-4 cursor-pointer hover:text-civic-950 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Severity</span>
                      {filters.sortBy === 'severity' && (
                        filters.sortOrder === 'asc' ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:text-civic-950 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {filters.sortBy === 'status' && (
                        filters.sortOrder === 'asc' ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('slaDeadline')}
                    className="py-3 px-4 cursor-pointer hover:text-civic-950 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>SLA Deadline</span>
                      {filters.sortBy === 'slaDeadline' && (
                        filters.sortOrder === 'asc' ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-civic-100 dark:divide-civic-800/60">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-civic-50/50 dark:hover:bg-civic-800/30 transition-colors"
                  >
                    {/* Issue ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-civic-900 dark:text-civic-100 whitespace-nowrap">
                      {issue.id}
                    </td>

                    {/* Title & Ward */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-civic-900 dark:text-civic-100 truncate" title={issue.title}>
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-civic-500 dark:text-civic-400 truncate">
                        {issue.locationName} • {issue.ward}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-civic-100 dark:bg-civic-800 text-civic-700 dark:text-civic-300 text-[11px] font-medium">
                        {issue.category}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${
                          SEVERITY_BADGES[issue.severity]
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-civic-700 dark:text-civic-300 whitespace-nowrap">
                      {issue.department}
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {issue.assignedStaffName ? (
                        <span className="font-medium text-civic-900 dark:text-civic-100">
                          {issue.assignedStaffName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          <WarningCircle size={12} weight="bold" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${
                          STATUS_BADGES[issue.status]
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>

                    {/* SLA Deadline */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <span className="text-civic-700 dark:text-civic-300">
                          {issue.slaDeadline.slice(0, 10)}
                        </span>
                        {issue.isSlaBreached && (
                          <div className="text-[10px] font-semibold text-red-600 dark:text-red-400">
                            SLA Breached
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action: Assign or Reassign */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {issue.assignedStaffName ? (
                        <button
                          type="button"
                          onClick={() => onOpenAssign(issue)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-civic-700 dark:text-civic-300 hover:text-civic-950 dark:hover:text-white bg-civic-100 hover:bg-civic-200 dark:bg-civic-800 dark:hover:bg-civic-700 rounded-md transition-colors cursor-pointer"
                        >
                          <ArrowsClockwise size={12} weight="bold" />
                          <span>Reassign</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenAssign(issue)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-civic-900 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white rounded-md shadow-sm transition-colors cursor-pointer"
                        >
                          <UserPlus size={12} weight="bold" />
                          <span>Assign</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
