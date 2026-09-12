import React, { useEffect } from 'react';
import { CircleNotch } from '@phosphor-icons/react';

export const DashboardPage: React.FC = (): React.JSX.Element => {
  // Redirect to home page: OAuth dashboard is deprecated in favor of home page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.replace('/');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100">
      <div className="flex flex-col items-center gap-3">
        <CircleNotch size={32} className="animate-spin text-accent" />
        <p className="text-sm font-medium text-civic-600 dark:text-civic-400">
          Redirecting to home page...
        </p>
      </div>
    </div>
  );
};
