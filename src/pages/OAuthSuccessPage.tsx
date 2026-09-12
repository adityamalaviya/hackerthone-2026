import React, { useEffect, useState } from 'react';
import { CircleNotch, CheckCircle } from '@phosphor-icons/react';
import { handleOAuthSuccess } from '../lib/appwrite';

export const OAuthSuccessPage: React.FC = (): React.JSX.Element => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function completeOAuthSession(): Promise<void> {
      try {
        await handleOAuthSuccess();
        if (isMounted) {
          setStatus('success');
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to establish Appwrite session';
        if (isMounted) {
          setStatus('error');
          setErrorMessage(message);
        }
        // Redirect to failure page with error reason
        const redirectUrl = `/auth/failure?error=${encodeURIComponent(message)}`;
        if (typeof window !== 'undefined' && window.location) {
          window.location.assign(redirectUrl);
        }
      }
    }

    void completeOAuthSession();

    return (): void => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-civic-50 dark:bg-civic-950 px-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-civic-900 border border-civic-200 dark:border-civic-800 shadow-xl text-center space-y-4">
        {status === 'processing' && (
          <>
            <div className="flex justify-center">
              <CircleNotch size={40} className="animate-spin text-accent" />
            </div>
            <h2 className="text-xl font-bold text-civic-950 dark:text-civic-50">
              Verifying Google Sign-In
            </h2>
            <p className="text-xs sm:text-sm text-civic-600 dark:text-civic-400">
              Securing your session and redirecting to the home page...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <CheckCircle size={44} weight="fill" className="text-status-resolved" />
            </div>
            <h2 className="text-xl font-bold text-civic-950 dark:text-civic-50">
              Authentication Successful
            </h2>
            <p className="text-xs sm:text-sm text-civic-600 dark:text-civic-400">
              Redirecting you to the home page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              Authentication Failed
            </h2>
            <p className="text-xs text-civic-600 dark:text-civic-400">
              {errorMessage || 'Unable to establish session. Redirecting to error page...'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
