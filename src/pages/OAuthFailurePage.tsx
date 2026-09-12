import React from 'react';
import { WarningCircle, ArrowLeft, ArrowCounterClockwise } from '@phosphor-icons/react';

export const OAuthFailurePage: React.FC = (): React.JSX.Element => {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rawError = urlParams ? urlParams.get('error') : null;
  const errorMessage = rawError || 'Google authentication was canceled or could not be completed.';

  const handleRetry = (): void => {
    window.location.assign('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-civic-50 dark:bg-civic-950 px-4 sm:px-6 py-12 transition-colors">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
            <WarningCircle size={32} weight="fill" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-civic-950 dark:text-civic-50 tracking-tight">
            Sign-In Failed
          </h1>
          <p className="text-xs sm:text-sm text-civic-600 dark:text-civic-400 mt-2">
            An issue occurred during Google OAuth2 authentication.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 text-left">
          <span className="text-2xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300 block mb-1">
            Error Details
          </span>
          <p className="text-xs text-red-600 dark:text-red-300 font-mono break-words">
            {errorMessage}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-3 px-4 bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-950 dark:hover:bg-white text-white text-xs sm:text-sm font-semibold tracking-wide rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
            <span>Return to Sign In</span>
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-medium text-civic-500 hover:text-civic-900 dark:text-civic-400 dark:hover:text-civic-200 transition-colors py-1"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Go to CivicFix Home</span>
          </a>
        </div>
      </div>
    </div>
  );
};
