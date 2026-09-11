import React from 'react';
import { Tray } from '@phosphor-icons/react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-civic-300 dark:border-civic-700 bg-civic-50/50 dark:bg-civic-900/30">
      <div className="w-12 h-12 rounded-full bg-civic-200/70 dark:bg-civic-800 flex items-center justify-center text-civic-600 dark:text-civic-300 mb-3.5 shadow-sm">
        {icon || <Tray size={24} weight="duotone" />}
      </div>
      <h3 className="text-sm font-semibold text-civic-900 dark:text-civic-100 mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-civic-500 dark:text-civic-400 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-civic-900 hover:bg-black dark:bg-civic-100 dark:text-civic-900 dark:hover:bg-white rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
