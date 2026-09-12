import React, { useState } from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import { signInWithGoogle } from '../../lib/appwrite';

interface GoogleSignInButtonProps {
  className?: string;
  onInitiate?: () => void;
  onError?: (error: Error) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  className = '',
  onInitiate,
  onError,
}): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async (): Promise<void> => {
    try {
      setIsLoading(true);
      onInitiate?.();
      await signInWithGoogle();
    } catch (err: unknown) {
      setIsLoading(false);
      const errorObj = err instanceof Error ? err : new Error('Unable to initiate Google sign in');
      onError?.(errorObj);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label="Sign in with Google"
      className={`relative inline-flex items-center justify-center gap-3 px-6 py-3.5 w-full bg-civic-900 hover:bg-black active:bg-civic-950 dark:bg-civic-50 dark:hover:bg-white dark:active:bg-civic-100 text-white dark:text-civic-950 text-sm font-semibold tracking-wide rounded-xl border border-civic-800 dark:border-civic-200 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 dark:focus:ring-offset-civic-900 cursor-pointer group ${className}`}
    >
      {isLoading ? (
        <CircleNotch size={20} className="animate-spin text-white dark:text-civic-950" />
      ) : (
        <span className="flex-shrink-0 flex items-center justify-center text-civic-300 dark:text-civic-700 group-hover:scale-105 transition-transform duration-200">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.7034 7.91133C14.7554 7.02509 13.4903 6.54228 12.1813 6.56212C9.78605 6.56212 7.75176 8.14611 7.02642 10.279V10.2791C6.64183 11.3968 6.64183 12.6071 7.02642 13.7249H7.02979C7.75849 15.8545 9.78941 17.4385 12.1847 17.4385C13.4211 17.4385 14.4826 17.1285 15.3053 16.5809V16.5787C16.2735 15.9504 16.9348 14.9616 17.1406 13.8439H12.1813V10.3783H20.8414C20.9494 10.9802 21 11.5952 21 12.207C21 14.9443 20.002 17.2586 18.2655 18.826L18.2673 18.8274C16.7458 20.203 14.6576 21 12.1813 21C8.70985 21 5.53527 19.082 3.97666 16.043V16.043C2.67445 13.5 2.67445 10.5039 3.97666 7.96096H3.97668L3.97666 7.96094C5.53527 4.9186 8.70985 3.00061 12.1813 3.00061C14.4619 2.97415 16.6649 3.8141 18.3247 5.34188L15.7034 7.91133Z"
              fill="#C4C6D7"
            />
          </svg>
        </span>
      )}
      <span className="font-semibold text-xs sm:text-sm">
        {isLoading ? 'Connecting to Google...' : 'Sign in with Google'}
      </span>
    </button>
  );
};
