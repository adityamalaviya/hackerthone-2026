import React from 'react';
import {
  ClockAfternoon,
  ArrowsClockwise,
  CheckCircle,
  Megaphone,
} from '@phosphor-icons/react';
import { AdminIssue } from '../../types/admin';
import { EmptyState } from './EmptyState';

interface EscalationQueueViewProps {
  escalatedIssues: AdminIssue[];
  onOpenAssign: (issue: AdminIssue) => void;
}

function formatOverdueTime(deadlineMs: number): string {
  const diff = Date.now() - deadlineMs;
  if (diff <= 0) return 'Within SLA';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) {
    return `+${hours}h overdue`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `+${days}d ${remHours}h overdue`;
}

export const EscalationQueueView: React.FC<EscalationQueueViewProps> = ({
  escalatedIssues,
  onOpenAssign,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-civic-900 border border-red-200 dark:border-red-950/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h2 className="text-base font-bold text-red-950 dark:text-red-100 tracking-tight">
              Escalation & SLA Breach Queue
            </h2>
          </div>
          <p className="text-xs text-civic-500 dark:text-civic-400 mt-1">
            Prioritized operational queue for issues that exceeded citizen SLA deadlines or received urgent escalation requests from field supervisors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200 border border-red-200 dark:border-red-800">
            {escalatedIssues.length} Critical Issues
          </span>
        </div>
      </div>

      {/* Escalation Queue Table */}
      {escalatedIssues.length === 0 ? (
        <EmptyState
          title="No escalated issues"
          description="All active civic reports are currently being resolved within their assigned SLA deadlines."
          icon={<CheckCircle size={26} weight="duotone" className="text-emerald-500" />}
        />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-red-50/50 dark:bg-red-950/30 border-b border-red-100 dark:border-red-950/60 text-civic-700 dark:text-civic-300 font-semibold select-none">
                  <th className="py-3 px-4">Issue ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Current Assignee</th>
                  <th className="py-3 px-4">Overdue Status</th>
                  <th className="py-3 px-4">Escalation Rationale</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-civic-100 dark:divide-civic-800/60">
                {escalatedIssues.map((issue) => {
                  const isBreached = issue.isSlaBreached;
                  const overdueLabel = formatOverdueTime(issue.slaDeadlineTimestamp);

                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-civic-50/50 dark:hover:bg-civic-800/30 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-civic-950 dark:text-civic-50 whitespace-nowrap">
                        {issue.id}
                      </td>

                      {/* Title & Location */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-civic-900 dark:text-civic-100 truncate" title={issue.title}>
                          {issue.title}
                        </div>
                        <div className="text-2xs text-civic-500 truncate">
                          {issue.locationName} • {issue.ward}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 whitespace-nowrap text-civic-700 dark:text-civic-300">
                        {issue.department}
                      </td>

                      {/* Current Assignee */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {issue.assignedStaffName ? (
                          <span className="font-medium text-civic-900 dark:text-civic-100">
                            {issue.assignedStaffName}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Overdue Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isBreached ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                            <ClockAfternoon size={12} weight="bold" />
                            <span>{overdueLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Megaphone size={12} weight="bold" />
                            <span>Staff Flagged</span>
                          </span>
                        )}
                      </td>

                      {/* Escalation Rationale */}
                      <td className="py-3 px-4 max-w-xs text-2xs text-civic-600 dark:text-civic-400 italic truncate" title={issue.escalationReason}>
                        {issue.escalationReason || 'SLA duration exceeded resolution threshold.'}
                      </td>

                      {/* Quick Reassign Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenAssign(issue)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          <ArrowsClockwise size={13} weight="bold" />
                          <span>Quick Reassign</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
