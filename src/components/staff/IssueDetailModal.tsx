import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  ChatCircleText,
  PaperPlaneRight,
  WarningCircle,
  Flag,
  ArrowSquareUpRight,
  CheckCircle,
  ShieldWarning,
  ArrowRight,
  User,
  Image as ImageIcon,
} from '@phosphor-icons/react';
import { StaffIssue, IssueStatus, IssueResolution } from '../../features/staff/types';
import { getValidNextStatuses, getSlaInfo } from '../../features/staff/stateMachine';
import { ResolutionModal } from './ResolutionModal';
import { FlagIssueModal } from './FlagIssueModal';
import { EscalationModal } from './EscalationModal';

interface IssueDetailModalProps {
  issue: StaffIssue | null;
  staffId: string;
  onClose: () => void;
  onUpdateStatus: (issueId: string, newStatus: IssueStatus, resolutionData?: IssueResolution) => { success: boolean; error?: string };
  onAddRemark: (issueId: string, text: string) => boolean;
  onFlagIssue: (issueId: string, reason: string) => boolean;
  onEscalateIssue: (issueId: string, note?: string) => boolean;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  staffId,
  onClose,
  onUpdateStatus,
  onAddRemark,
  onFlagIssue,
  onEscalateIssue,
}) => {
  const [remarkInput, setRemarkInput] = useState('');
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!issue) return null;

  const validNextStatuses = getValidNextStatuses(issue.status);
  const sla = getSlaInfo(issue.slaDeadline);

  const handleStatusClick = (nextStatus: IssueStatus) => {
    setActionError(null);
    if (nextStatus === 'Resolved') {
      // Must open mandatory proof modal
      setIsResolutionModalOpen(true);
      return;
    }

    const res = onUpdateStatus(issue.id, nextStatus);
    if (!res.success) {
      setActionError(res.error || 'Failed to update status');
    }
  };

  const handleResolutionSubmit = (resolution: IssueResolution) => {
    const res = onUpdateStatus(issue.id, 'Resolved', resolution);
    if (!res.success) {
      setActionError(res.error || 'Failed to update status');
    }
  };

  const handleAddRemarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkInput.trim()) return;
    const ok = onAddRemark(issue.id, remarkInput.trim());
    if (ok) {
      setRemarkInput('');
    }
  };

  const severityColors = {
    Low: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    High: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    Critical: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  }[issue.severity];

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl bg-white dark:bg-civic-900 rounded-2xl shadow-2xl border border-civic-200 dark:border-civic-800 overflow-hidden flex flex-col max-h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-civic-200 dark:border-civic-800 flex items-center justify-between bg-civic-50 dark:bg-civic-850 flex-shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs font-bold text-civic-900 dark:text-civic-100 bg-white dark:bg-civic-800 px-2.5 py-1 rounded-md border border-civic-200 dark:border-civic-700 shadow-xs">
                {issue.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-civic-200 dark:bg-civic-800 text-civic-800 dark:text-civic-200">
                {issue.category}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${severityColors}`}>
                {issue.severity.toUpperCase()} SEVERITY
              </span>
              {issue.flag?.isFlagged && (
                <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  <ShieldWarning size={13} weight="fill" />
                  Pending Admin Review
                </span>
              )}
              {issue.escalation?.isEscalated && (
                <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  <ArrowSquareUpRight size={13} weight="bold" />
                  Escalated
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-civic-400 hover:text-civic-700 dark:hover:text-civic-200 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Scrollable Content */}
          <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
            {actionError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <WarningCircle size={16} weight="fill" className="text-red-500" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Quick Status & SLA Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-civic-50 dark:bg-civic-800/60 border border-civic-200/80 dark:border-civic-700 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-3xs font-bold uppercase tracking-wider text-civic-400 dark:text-civic-500 block">
                    Lifecycle State
                  </span>
                  <span className="text-sm font-bold text-civic-900 dark:text-civic-100 flex items-center gap-1.5 mt-0.5">
                    {issue.status === 'Resolved' && <CheckCircle size={15} weight="fill" className="text-emerald-500" />}
                    {issue.status}
                  </span>
                </div>
                <span className="text-2xs text-civic-500 dark:text-civic-400 font-medium px-2 py-1 bg-white dark:bg-civic-900 rounded-md border border-civic-200 dark:border-civic-800 shadow-xs">
                  State: {issue.status}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  sla.isOverdue
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
                    : sla.urgency === 'critical'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <div>
                  <span
                    className={`text-3xs font-bold uppercase tracking-wider block ${
                      sla.isOverdue
                        ? 'text-red-600 dark:text-red-400'
                        : sla.urgency === 'critical'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    SLA Window
                  </span>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 mt-0.5 ${
                      sla.isOverdue
                        ? 'text-red-800 dark:text-red-300'
                        : sla.urgency === 'critical'
                        ? 'text-amber-800 dark:text-amber-300'
                        : 'text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    <Clock size={15} weight="bold" />
                    {sla.timeRemainingFormatted}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xs font-mono text-civic-500 dark:text-civic-400 block">
                    Deadline:
                  </span>
                  <span className="text-2xs font-semibold text-civic-800 dark:text-civic-200">
                    {new Date(issue.slaDeadline).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Two Column: Photo & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Photo Attachment & Location */}
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-civic-200 dark:border-civic-700 bg-civic-100 dark:bg-civic-800 group">
                  <img
                    src={issue.photoUrl}
                    alt={issue.shortDescription}
                    className="w-full h-52 sm:h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-civic-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-2xs text-white flex items-center gap-1.5">
                    <ImageIcon size={13} />
                    <span>Citizen Report Attachment</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-civic-800 border border-civic-200 dark:border-civic-700 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-civic-900 dark:text-civic-100">
                    <MapPin size={15} weight="fill" className="text-accent flex-shrink-0" />
                    <span>{issue.locationName}</span>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-civic-500 dark:text-civic-400 pl-5">
                    <span>{issue.ward}</span>
                    <span className="font-mono">
                      {issue.latitude.toFixed(4)}°N, {issue.longitude.toFixed(4)}°E
                    </span>
                  </div>
                </div>
              </div>

              {/* Citizen Description & Metadata */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-civic-900 dark:text-civic-100 mb-1 leading-snug">
                    {issue.shortDescription}
                  </h4>
                  <div className="p-3 bg-civic-50 dark:bg-civic-800/70 border border-civic-200/80 dark:border-civic-700 rounded-xl mt-2 text-xs text-civic-700 dark:text-civic-300 leading-relaxed whitespace-pre-wrap">
                    <span className="text-3xs font-bold uppercase tracking-wider text-civic-400 dark:text-civic-500 block mb-1">
                      Citizen Description:
                    </span>
                    {issue.citizenDescription}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs pt-2 border-t border-civic-200 dark:border-civic-700">
                  <div>
                    <span className="text-civic-400 dark:text-civic-500 block">Department:</span>
                    <span className="font-semibold text-civic-800 dark:text-civic-200">{issue.department}</span>
                  </div>
                  <div>
                    <span className="text-civic-400 dark:text-civic-500 block">Assigned Date:</span>
                    <span className="font-semibold text-civic-800 dark:text-civic-200">
                      {new Date(issue.assignedDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* If Flagged info */}
                {issue.flag?.isFlagged && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                    <span className="font-bold block mb-0.5">Flagged Reason (Pending Admin Review):</span>
                    <span>{issue.flag.reason}</span>
                  </div>
                )}

                {/* If Resolution info */}
                {issue.resolution && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={15} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                        Resolution Verified
                      </span>
                      <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-normal">
                        {new Date(issue.resolution.resolvedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-200 text-2xs">
                      {issue.resolution.notes}
                    </p>
                    {issue.resolution.proofPhotoUrl && (
                      <img
                        src={issue.resolution.proofPhotoUrl}
                        alt="Proof"
                        className="w-full h-32 object-cover rounded-lg border border-emerald-200 dark:border-emerald-700"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* STATUS TRANSITION CONTROLS (Strictly enforces valid next-status only) */}
            <div className="p-4 bg-civic-50 dark:bg-civic-800/60 border border-civic-200 dark:border-civic-700 rounded-xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-civic-900 dark:text-civic-100 uppercase tracking-wider">
                    Workflow Status Progression
                  </h4>
                  <p className="text-2xs text-civic-500 dark:text-civic-400 mt-0.5">
                    {validNextStatuses.length > 0
                      ? 'Select the legally permitted next phase for this ticket.'
                      : issue.status === 'Resolved'
                      ? 'Issue is marked Resolved. Final closure requires citizen review or admin approval.'
                      : 'No further status transitions permitted.'}
                  </p>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {validNextStatuses.map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      onClick={() => handleStatusClick(nextStatus)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all active:scale-95 cursor-pointer ${
                        nextStatus === 'Resolved'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-civic-900 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white'
                      }`}
                    >
                      <span>Advance to {nextStatus}</span>
                      <ArrowRight size={14} weight="bold" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION TOOLBAR: Flag Duplicate + Request Escalation */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-civic-200 dark:border-civic-700">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(true)}
                  disabled={issue.flag?.isFlagged}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors cursor-pointer"
                >
                  <Flag size={14} weight="fill" />
                  <span>{issue.flag?.isFlagged ? 'Flagged (Pending Review)' : 'Flag as Duplicate / Invalid'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(true)}
                  disabled={issue.escalation?.isEscalated}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowSquareUpRight size={14} weight="bold" />
                  <span>{issue.escalation?.isEscalated ? 'Escalated' : 'Request Escalation'}</span>
                </button>
              </div>
            </div>

            {/* INTERNAL REMARKS (Chronological list + text input) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-civic-900 dark:text-civic-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ChatCircleText size={16} weight="bold" />
                  <span>Internal Remarks & Audit Trail</span>
                </h4>
                <span className="text-2xs text-civic-500 dark:text-civic-400 font-mono">
                  {issue.internalRemarks.length} remarks
                </span>
              </div>

              {/* Remarks List */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {issue.internalRemarks.length === 0 ? (
                  <p className="text-xs text-civic-400 dark:text-civic-500 italic py-2 text-center bg-civic-50 dark:bg-civic-800/60 rounded-lg">
                    No internal remarks recorded yet. Add initial notes below.
                  </p>
                ) : (
                  issue.internalRemarks.map((remark) => (
                    <div
                      key={remark.id}
                      className="p-3 bg-civic-50 dark:bg-civic-800/60 rounded-xl border border-civic-200 dark:border-civic-700 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-civic-500 dark:text-civic-400 text-2xs">
                        <span className="font-semibold text-civic-900 dark:text-civic-100 flex items-center gap-1">
                          <User size={12} weight="bold" />
                          {remark.staffName} ({remark.staffId})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(remark.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-civic-800 dark:text-civic-200 whitespace-pre-wrap leading-relaxed">
                        {remark.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Remark Form */}
              <form onSubmit={handleAddRemarkSubmit} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={remarkInput}
                  onChange={(e) => setRemarkInput(e.target.value)}
                  placeholder="Type an internal note (e.g., materials dispatched, contractor notified)..."
                  className="flex-1 text-xs text-civic-900 dark:text-civic-100 bg-white dark:bg-civic-800 border border-civic-300 dark:border-civic-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent placeholder:text-civic-400 dark:placeholder:text-civic-500"
                />
                <button
                  type="submit"
                  disabled={!remarkInput.trim()}
                  className="px-4 py-2.5 bg-civic-900 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Post</span>
                  <PaperPlaneRight size={14} weight="bold" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <ResolutionModal
        isOpen={isResolutionModalOpen}
        issueId={issue.id}
        staffId={staffId}
        onClose={() => setIsResolutionModalOpen(false)}
        onSubmit={handleResolutionSubmit}
      />

      <FlagIssueModal
        isOpen={isFlagModalOpen}
        issueId={issue.id}
        onClose={() => setIsFlagModalOpen(false)}
        onSubmit={(reason) => onFlagIssue(issue.id, reason)}
      />

      <EscalationModal
        isOpen={isEscalateModalOpen}
        issueId={issue.id}
        onClose={() => setIsEscalateModalOpen(false)}
        onSubmit={(note) => onEscalateIssue(issue.id, note)}
      />
    </>
  );
};
