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
  HourglassHigh,
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
    Low: 'bg-sky-50 text-sky-700 border-sky-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-300',
  }[issue.severity];

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-civic-200 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-civic-200 flex items-center justify-between bg-civic-50 flex-shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs font-bold text-civic-900 bg-white px-2.5 py-1 rounded-md border border-civic-200 shadow-xs">
                {issue.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-civic-200 text-civic-800">
                {issue.category}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${severityColors}`}>
                {issue.severity.toUpperCase()} SEVERITY
              </span>
              {issue.flag?.isFlagged && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  <ShieldWarning size={13} weight="fill" />
                  Pending Admin Review
                </span>
              )}
              {issue.escalation?.isEscalated && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                  <ArrowSquareUpRight size={13} weight="bold" />
                  Escalated
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-civic-400 hover:text-civic-700 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Scrollable Content */}
          <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <WarningCircle size={16} weight="fill" className="text-red-500" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Quick Status & SLA Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-civic-100/70 border border-civic-200 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-civic-500 font-medium">Current Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-civic-900 text-white">
                  {issue.status === 'Resolved' && <CheckCircle size={14} weight="fill" className="text-emerald-400" />}
                  {issue.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <HourglassHigh size={16} className={sla.isOverdue ? 'text-red-600' : 'text-civic-600'} />
                <span className="text-civic-600">SLA Resolution Target:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded ${
                    sla.isOverdue
                      ? 'bg-red-100 text-red-700 font-bold animate-pulse'
                      : sla.urgency === 'critical'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {sla.timeRemainingFormatted}
                </span>
              </div>
            </div>

            {/* Photo & Core Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Photo & GPS */}
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-civic-200 bg-civic-100 group">
                  <img
                    src={issue.photoUrl}
                    alt={issue.shortDescription}
                    className="w-full h-52 sm:h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-civic-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white flex items-center gap-1.5">
                    <ImageIcon size={13} />
                    <span>Citizen Report Attachment</span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-civic-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-civic-900">
                    <MapPin size={15} weight="fill" className="text-accent flex-shrink-0" />
                    <span>{issue.locationName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-civic-500 pl-5">
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
                  <h4 className="text-sm font-bold text-civic-900 mb-1 leading-snug">
                    {issue.shortDescription}
                  </h4>
                  <div className="p-3 bg-civic-50 border border-civic-200/80 rounded-xl mt-2 text-xs text-civic-700 leading-relaxed whitespace-pre-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-civic-400 block mb-1">
                      Citizen Description:
                    </span>
                    {issue.citizenDescription}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-civic-200">
                  <div>
                    <span className="text-civic-400 block">Department:</span>
                    <span className="font-semibold text-civic-800">{issue.department}</span>
                  </div>
                  <div>
                    <span className="text-civic-400 block">Assigned Date:</span>
                    <span className="font-semibold text-civic-800">
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
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <span className="font-bold block mb-0.5">Flagged Reason (Pending Admin Review):</span>
                    <span>{issue.flag.reason}</span>
                  </div>
                )}

                {/* If Resolution info */}
                {issue.resolution && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={15} weight="fill" className="text-emerald-600" />
                        Resolution Verified
                      </span>
                      <span className="text-[11px] text-emerald-700 font-normal">
                        {new Date(issue.resolution.resolvedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[11px]">
                      {issue.resolution.notes}
                    </p>
                    {issue.resolution.proofPhotoUrl && (
                      <img
                        src={issue.resolution.proofPhotoUrl}
                        alt="Proof"
                        className="w-full h-32 object-cover rounded-lg border border-emerald-200"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* STATUS TRANSITION CONTROLS (Strictly enforces valid next-status only) */}
            <div className="p-4 bg-civic-50 border border-civic-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-civic-900 uppercase tracking-wider">
                    Workflow Status Progression
                  </h4>
                  <p className="text-[11px] text-civic-500 mt-0.5">
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
                          : 'bg-civic-900 hover:bg-black'
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
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-civic-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(true)}
                  disabled={issue.flag?.isFlagged}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors cursor-pointer"
                >
                  <Flag size={14} weight="fill" />
                  <span>{issue.flag?.isFlagged ? 'Flagged (Pending Review)' : 'Flag as Duplicate / Invalid'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(true)}
                  disabled={issue.escalation?.isEscalated}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowSquareUpRight size={14} weight="bold" />
                  <span>{issue.escalation?.isEscalated ? 'Escalated' : 'Request Escalation'}</span>
                </button>
              </div>
            </div>

            {/* INTERNAL REMARKS (Chronological list + text input) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-civic-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ChatCircleText size={16} weight="bold" />
                  <span>Internal Remarks & Audit Trail</span>
                </h4>
                <span className="text-[11px] text-civic-500 font-mono">
                  {issue.internalRemarks.length} remarks
                </span>
              </div>

              {/* Remarks List */}
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {issue.internalRemarks.length === 0 ? (
                  <p className="text-xs text-civic-400 italic py-2 text-center bg-civic-50 rounded-lg">
                    No internal remarks recorded yet. Add initial notes below.
                  </p>
                ) : (
                  issue.internalRemarks.map((remark) => (
                    <div
                      key={remark.id}
                      className="p-3 bg-civic-50 rounded-xl border border-civic-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-civic-500 text-[11px]">
                        <span className="font-semibold text-civic-900 flex items-center gap-1">
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
                      <p className="text-civic-800 whitespace-pre-wrap leading-relaxed">
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
                  className="flex-1 text-xs text-civic-900 bg-white border border-civic-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent placeholder:text-civic-400"
                />
                <button
                  type="submit"
                  disabled={!remarkInput.trim()}
                  className="px-4 py-2.5 bg-civic-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
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
