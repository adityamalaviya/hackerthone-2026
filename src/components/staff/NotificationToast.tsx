import React, { useEffect } from 'react';
import { BellRinging, X, ArrowRight } from '@phosphor-icons/react';
import { StaffNotification } from '../../features/staff/useStaffIssues';

interface NotificationToastProps {
  toast: StaffNotification | null;
  onDismiss: () => void;
  onViewIssue: (issueId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toast,
  onDismiss,
  onViewIssue,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-civic-950 text-white rounded-xl shadow-2xl border border-civic-800 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0 text-accent">
          <BellRinging size={20} weight="fill" className="animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              New Issue Assigned
            </span>
            <span className="text-[11px] text-civic-400">{toast.timestamp}</span>
          </div>

          <p className="text-xs font-bold text-white mt-1 truncate">
            {toast.issueId} • {toast.category}
          </p>

          <p className="text-xs text-civic-300 mt-0.5 line-clamp-2 leading-relaxed">
            {toast.shortDescription}
          </p>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-civic-800">
            <button
              type="button"
              onClick={() => {
                onViewIssue(toast.issueId);
                onDismiss();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-orange-400 transition-colors cursor-pointer"
            >
              <span>Inspect Ticket</span>
              <ArrowRight size={13} weight="bold" />
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="text-civic-400 hover:text-white transition-colors text-xs p-1"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
