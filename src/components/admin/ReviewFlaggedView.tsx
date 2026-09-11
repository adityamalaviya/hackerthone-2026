import React, { useState } from 'react';
import {
  Flag,
  Check,
  X,
  Warning,
  Copy,
  ChatCircleDots,
  ShieldCheck,
} from '@phosphor-icons/react';
import { AdminIssue, FlagResolutionPayload } from '../../types/admin';
import { EmptyState } from './EmptyState';

interface ReviewFlaggedViewProps {
  flaggedIssues: AdminIssue[];
  onResolveFlag: (payload: FlagResolutionPayload) => Promise<boolean>;
}

export const ReviewFlaggedView: React.FC<ReviewFlaggedViewProps> = ({
  flaggedIssues,
  onResolveFlag,
}) => {
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (issueId: string, action: 'approve' | 'reject') => {
    setProcessingId(issueId);
    await onResolveFlag({
      issueId,
      action,
      adminNotes: adminNotes[issueId] || '',
    });
    setProcessingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base font-bold text-civic-950 dark:text-civic-50 tracking-tight">
              Pending Review — Flagged Issues
            </h2>
          </div>
          <p className="text-xs text-civic-500 dark:text-civic-400 mt-1">
            Issues marked as duplicate, invalid, or outside municipal scope by field staff. Admin decision is required to either close the report or return it to the active field queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {flaggedIssues.length} Pending Actions
          </span>
        </div>
      </div>

      {/* List of Flagged Issues */}
      {flaggedIssues.length === 0 ? (
        <EmptyState
          title="No pending flags to review"
          description="All flagged issues have been verified and processed by the administration team."
          icon={<ShieldCheck size={26} weight="duotone" />}
        />
      ) : (
        <div className="space-y-4">
          {flaggedIssues.map((issue) => {
            const isProcessing = processingId === issue.id;
            const flagType = issue.flagged.type || 'invalid';

            return (
              <div
                key={issue.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-sm space-y-4 transition-all"
              >
                {/* Top Badge & ID */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-civic-100 dark:border-civic-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-civic-900 dark:text-civic-100">
                      {issue.id}
                    </span>
                    <span className="text-civic-400">•</span>
                    <span className="text-xs text-civic-600 dark:text-civic-300 font-medium">
                      {issue.department}
                    </span>
                    <span className="text-civic-400">•</span>
                    <span className="text-xs text-civic-500">
                      {issue.locationName} ({issue.ward})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        flagType === 'duplicate'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {flagType === 'duplicate' ? (
                        <Copy size={12} weight="bold" />
                      ) : (
                        <Warning size={12} weight="bold" />
                      )}
                      <span className="uppercase tracking-wider">
                        {flagType}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Issue Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-civic-950 dark:text-civic-50">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-civic-600 dark:text-civic-400 mt-1 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                {/* Staff Flag Justification Box */}
                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Flag size={14} weight="fill" className="text-amber-600 dark:text-amber-400" />
                      <span>Staff Flag Reason:</span>
                    </span>
                    <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      Flagged by {issue.flagged.flaggedByStaffName || 'Assigned Officer'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-amber-950 dark:text-amber-100 leading-relaxed italic">
                    "{issue.flagged.reason || 'Flagged for administrative verification.'}"
                  </p>
                </div>

                {/* Admin Decision Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-civic-100 dark:border-civic-800/80">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <ChatCircleDots
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-400"
                      />
                      <input
                        type="text"
                        placeholder="Optional remarks / closure note for municipal log..."
                        value={adminNotes[issue.id] || ''}
                        onChange={(e) =>
                          setAdminNotes({ ...adminNotes, [issue.id]: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-civic-50 dark:bg-civic-800/80 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-900 dark:text-civic-100 placeholder-civic-400 focus:outline-none focus:ring-1 focus:ring-civic-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Action 1: Reject Flag (Returns to Queue) */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(issue.id, 'reject')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-civic-700 dark:text-civic-300 hover:text-red-700 dark:hover:text-red-400 bg-civic-100 hover:bg-red-50 dark:bg-civic-800 dark:hover:bg-red-950/40 rounded-lg border border-civic-200 dark:border-civic-700 hover:border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <X size={13} weight="bold" />
                      <span>Reject Flag (Return to Queue)</span>
                    </button>

                    {/* Action 2: Approve Flag (Closes Issue) */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(issue.id, 'approve')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      <Check size={13} weight="bold" />
                      <span>Approve Flag (Close Issue)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
