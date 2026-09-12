import React, { useEffect, useState } from 'react';
import { CircleNotch, ArrowLeft, ShieldCheck } from '@phosphor-icons/react';
import { account } from '../lib/appwrite';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { DotGridDecoration } from '../components/auth/DotGridDecoration';

export const AuthPage: React.FC = (): React.JSX.Element => {
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth Guard: On /auth: await account.get(). If it succeeds, redirect to home page (/).
  useEffect(() => {
    let isMounted = true;

    async function checkExistingAuth(): Promise<void> {
      try {
        await account.get();
        if (isMounted) {
          window.location.assign('/');
        }
      } catch {
        // Not authenticated: render the sign-in screen
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    void checkExistingAuth();

    return (): void => {
      isMounted = false;
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100">
        <div className="flex flex-col items-center gap-3">
          <CircleNotch size={32} className="animate-spin text-accent" />
          <p className="text-sm font-medium text-civic-600 dark:text-civic-400">
            Checking authentication status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-civic-50 dark:bg-civic-950 px-4 sm:px-6 py-12 transition-colors">
      <div className="w-full max-w-md">
        {/* Navigation back to landing page */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-civic-600 dark:text-civic-400 hover:text-civic-950 dark:hover:text-civic-100 transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Back to CivicFix Gandhidham</span>
          </a>
        </div>

        {/* Auth Card */}
        <div className="relative bg-white dark:bg-civic-900 rounded-3xl p-8 sm:p-10 shadow-xl border border-civic-200 dark:border-civic-800">
          <DotGridDecoration rows={4} cols={5} />

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              <span className="text-2xs font-semibold uppercase tracking-wider text-civic-500 dark:text-civic-400">
                CivicFix Authentication
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-civic-950 dark:text-civic-50 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-civic-600 dark:text-civic-400 mt-2 leading-relaxed">
              Sign in securely to report municipal issues, track resolution statuses, and access your citizen dashboard.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Primary CTA: Google Sign-In */}
          <div className="space-y-4">
            <GoogleSignInButton
              onError={(err: Error): void => setErrorMessage(err.message)}
            />

            <div className="flex items-center justify-center gap-2 pt-4 text-center text-xs text-civic-500 dark:text-civic-400">
              <ShieldCheck size={16} weight="fill" className="text-status-resolved shrink-0" />
              <span>Protected by Appwrite OAuth2 Security</span>
            </div>
          </div>

          {/* Alternative portal links */}
          <div className="mt-8 pt-6 border-t border-civic-100 dark:border-civic-800 text-center">
            <p className="text-xs text-civic-500 dark:text-civic-400">
              Looking for employee access?{' '}
              <a
                href="/?view=staff"
                className="font-semibold text-civic-900 dark:text-civic-200 hover:text-accent dark:hover:text-accent underline underline-offset-2"
              >
                Staff Portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
