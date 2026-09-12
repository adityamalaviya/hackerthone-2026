import React from 'react';
import {
  MapPin,
  Calendar,
  HourglassHigh,
  CaretRight,
  ShieldWarning,
  ArrowSquareUpRight,
  CheckCircle,
} from '@phosphor-icons/react';
import { StaffIssue } from '../../features/staff/types';
import { getSlaInfo } from '../../features/staff/stateMachine';

interface IssueQueueListProps {
  issues: StaffIssue[];
  selectedIssueId?: string;
  onSelectIssue: (issue: StaffIssue) => void;
}

export const IssueQueueList: React.FC<IssueQueueListProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
}) => {
  return (
    <div className="space-y-3">
      {issues.map((issue) => {
        const sla = getSlaInfo(issue.slaDeadline);
        const isSelected = issue.id === selectedIssueId;

        const severityStyles = {
          Low: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
          Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          High: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
          Critical: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        }[issue.severity];

        return (
          <div
            key={issue.id}
            onClick={() => onSelectIssue(issue)}
            className={`group relative bg-white dark:bg-civic-900 border rounded-xl p-4 sm:p-5 transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md hover:border-civic-400 dark:hover:border-civic-600 text-left active:scale-95 ${
              isSelected
                ? 'border-accent ring-2 ring-accent/15 bg-accent/5 dark:bg-accent/10'
                : 'border-civic-200 dark:border-civic-800'
            }`}
          >
            {/* Top Row: IDs, Category, Badges */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-civic-900 dark:text-civic-100 bg-civic-100 dark:bg-civic-800 px-2 py-0.5 rounded border border-civic-200 dark:border-civic-700">
                  {issue.id}
                </span>
                <span className="text-xs font-semibold text-civic-700 dark:text-civic-300 px-2 py-0.5 rounded-full bg-civic-100 dark:bg-civic-800">
                  {issue.category}
                </span>
                <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${severityStyles}`}>
                  {issue.severity.toUpperCase()}
                </span>
              </div>

              {/* Status & Flag Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {issue.flag?.isFlagged && (
                  <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <ShieldWarning size={12} weight="fill" />
                    Pending Admin Review
                  </span>
                )}
                {issue.escalation?.isEscalated && (
                  <span className="inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <ArrowSquareUpRight size={12} weight="bold" />
                    Escalated
                  </span>
                )}
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-civic-900 text-white dark:bg-civic-100 dark:text-civic-950 flex items-center gap-1">
                  {issue.status === 'Resolved' && <CheckCircle size={12} weight="fill" className="text-emerald-400 dark:text-emerald-600" />}
                  {issue.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <h4 className="text-sm font-semibold text-civic-950 dark:text-civic-50 mb-1.5 group-hover:text-black dark:group-hover:text-white line-clamp-2">
              {issue.shortDescription}
            </h4>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-civic-600 dark:text-civic-400 mb-3">
              <MapPin size={14} weight="fill" className="text-accent flex-shrink-0" />
              <span className="truncate">{issue.locationName}</span>
              <span className="text-civic-400 dark:text-civic-500">• {issue.ward}</span>
            </div>

            {/* Bottom Row: Assigned Date, SLA Countdown */}
            <div className="flex items-center justify-between pt-2.5 border-t border-civic-100 dark:border-civic-800/80 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-civic-500 dark:text-civic-400 text-2xs">
                <Calendar size={13} />
                <span>
                  Assigned{' '}
                  {new Date(issue.assignedDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-1 rounded-md ${
                    sla.isOverdue
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse'
                      : sla.urgency === 'critical'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <HourglassHigh size={13} weight="bold" />
                  <span>SLA: {sla.timeRemainingFormatted}</span>
                </div>

                <div className="text-civic-400 dark:text-civic-500 group-hover:text-civic-800 dark:group-hover:text-civic-200 group-hover:translate-x-0.5 transition-all">
                  <CaretRight size={16} weight="bold" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
