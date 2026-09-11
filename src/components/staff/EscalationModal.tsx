import React, { useState } from 'react';
import { X, ArrowSquareUpRight, ShieldWarning } from '@phosphor-icons/react';

interface EscalationModalProps {
  isOpen: boolean;
  issueId: string;
  onClose: () => void;
  onSubmit: (note?: string) => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  issueId,
  onClose,
  onSubmit,
}) => {
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-civic-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-civic-200 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
              <ArrowSquareUpRight size={18} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-civic-950">
                Request Escalation
              </h3>
              <p className="text-[11px] text-rose-800">
                Issue {issueId}
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-civic-100 rounded-xl flex items-start gap-2 text-xs text-civic-700 border border-civic-200">
            <ShieldWarning size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>
              Escalating this ticket immediately alerts the <strong>Executive Engineer & Municipal Commissioner Office</strong> for resource reallocation or contractor intervention.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-civic-800 uppercase tracking-wider mb-1.5">
              Escalation Justification <span className="text-civic-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., Requires specialized hydraulic equipment not available in local ward depot..."
              className="w-full text-xs text-civic-900 bg-white border border-civic-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-civic-400"
            />
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowSquareUpRight size={15} weight="bold" />
              <span>Confirm Escalation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
