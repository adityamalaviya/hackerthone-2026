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
      <div className="relative w-full max-w-md bg-white dark:bg-civic-900 rounded-2xl shadow-2xl border border-civic-200 dark:border-civic-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-civic-200 dark:border-civic-800 flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Flag size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-civic-950 dark:text-civic-50">
                Flag Issue {issueId}
              </h3>
              <p className="text-2xs text-amber-800 dark:text-amber-300">
                Flags ticket for Admin Review
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-civic-400 hover:text-civic-700 dark:hover:text-civic-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-civic-100 dark:bg-civic-800/60 rounded-xl flex items-start gap-2 text-xs text-civic-700 dark:text-civic-300 border border-civic-200 dark:border-civic-700">
            <ShieldWarning size={16} className="text-civic-600 dark:text-civic-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Staff cannot unilaterally close or discard issues. Flagging tags this ticket with a <strong>Pending Admin Review</strong> badge while retaining it in the queue.
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <Warning size={15} weight="fill" className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-civic-800 dark:text-civic-200 uppercase tracking-wider mb-1.5">
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
              className="w-full text-xs text-civic-900 dark:text-civic-100 bg-white dark:bg-civic-800 border border-civic-300 dark:border-civic-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-civic-400 dark:placeholder:text-civic-500"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-2xs font-semibold text-civic-500 dark:text-civic-400 block mb-1.5">
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
                  className="text-left text-2xs px-2.5 py-1.5 bg-civic-50 dark:bg-civic-800/80 hover:bg-civic-100 dark:hover:bg-civic-700 border border-civic-200 dark:border-civic-700 rounded-lg text-civic-700 dark:text-civic-300 transition-colors cursor-pointer"
                >
                  • {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-civic-200 dark:border-civic-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-civic-600 dark:text-civic-400 hover:text-civic-900 dark:hover:text-civic-100 transition-colors"
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
