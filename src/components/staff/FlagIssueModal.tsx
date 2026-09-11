import React, { useState } from 'react';
import { X, Flag, Warning, ShieldWarning } from '@phosphor-icons/react';

interface FlagIssueModalProps {
  isOpen: boolean;
  issueId: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const PRESET_REASONS = [
  'Duplicate report of existing active ticket in same ward',
  'Private property / beyond Gandhidham Municipal jurisdiction',
  'False report / issue verified non-existent upon field inspection',
  'Misclassified category requiring administrative reassignment',
];

export const FlagIssueModal: React.FC<FlagIssueModalProps> = ({
  isOpen,
  issueId,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A specific reason is required to flag an issue for Admin review.');
      return;
    }
    onSubmit(reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-civic-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-civic-200 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <Flag size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-civic-950">
                Flag Issue {issueId}
              </h3>
              <p className="text-[11px] text-amber-800">
                Flags ticket for Admin Review
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-civic-400 hover:text-civic-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-civic-100 rounded-xl flex items-start gap-2 text-xs text-civic-700 border border-civic-200">
            <ShieldWarning size={16} className="text-civic-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Staff cannot unilaterally close or discard issues. Flagging tags this ticket with a <strong>Pending Admin Review</strong> badge while retaining it in the queue.
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <Warning size={15} weight="fill" className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-civic-800 uppercase tracking-wider mb-1.5">
              Reason for Flagging <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="State why this ticket is duplicate, out of jurisdiction, or invalid..."
              className="w-full text-xs text-civic-900 bg-white border border-civic-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-civic-400"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[11px] font-semibold text-civic-500 block mb-1.5">
              Quick presets:
            </span>
            <div className="flex flex-col gap-1.5">
              {PRESET_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setReason(preset);
                    setError(null);
                  }}
                  className="text-left text-[11px] px-2.5 py-1.5 bg-civic-50 hover:bg-civic-100 border border-civic-200 rounded-lg text-civic-700 transition-colors cursor-pointer"
                >
                  • {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-civic-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-civic-600 hover:text-civic-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Flag size={14} weight="bold" />
              <span>Submit for Admin Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
