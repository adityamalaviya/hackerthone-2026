import React from 'react';

interface LoadingSkeletonProps {
  type?: 'cards' | 'table' | 'charts' | 'full';
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'full',
  rows = 5,
}) => {
  return (
    <div className="w-full space-y-6 animate-pulse" aria-busy="true" aria-label="Loading content">
      {(type === 'cards' || type === 'full') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 bg-civic-200 dark:bg-civic-800 rounded-md" />
                <div className="w-8 h-8 rounded-lg bg-civic-100 dark:bg-civic-800" />
              </div>
              <div className="h-7 w-16 bg-civic-200 dark:bg-civic-800 rounded-md" />
              <div className="h-3 w-32 bg-civic-100 dark:bg-civic-800 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {(type === 'charts' || type === 'full') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 space-y-4 shadow-sm">
            <div className="h-4 w-36 bg-civic-200 dark:bg-civic-800 rounded-md" />
            <div className="h-44 w-full bg-civic-100 dark:bg-civic-800/60 rounded-xl" />
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 space-y-4 shadow-sm">
            <div className="h-4 w-40 bg-civic-200 dark:bg-civic-800 rounded-md" />
            <div className="h-44 w-full bg-civic-100 dark:bg-civic-800/60 rounded-xl" />
          </div>
        </div>
      )}

      {(type === 'table' || type === 'full') && (
        <div className="rounded-2xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-civic-100 dark:border-civic-800">
            <div className="h-4 w-32 bg-civic-200 dark:bg-civic-800 rounded-md" />
            <div className="h-8 w-48 bg-civic-100 dark:bg-civic-800 rounded-lg" />
          </div>
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b border-civic-50 dark:border-civic-800/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-civic-100 dark:bg-civic-800" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-48 bg-civic-200 dark:bg-civic-800 rounded-md" />
                  <div className="h-2.5 w-28 bg-civic-100 dark:bg-civic-800 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-16 bg-civic-100 dark:bg-civic-800 rounded-full" />
                <div className="h-5 w-20 bg-civic-100 dark:bg-civic-800 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
