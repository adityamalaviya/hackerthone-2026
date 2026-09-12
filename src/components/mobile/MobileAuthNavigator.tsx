import React, { useEffect, useState, useCallback } from 'react';
import { AuthScreen } from './AuthScreen';
import { DashboardScreen } from './DashboardScreen';
import { account, getCurrentUser, AppwriteUser } from '../../lib/appwriteMobile';

export type ScreenState = 'loading' | 'auth' | 'callback' | 'dashboard' | 'error';

export interface MobileAuthNavigatorProps {
  initialUrl?: string;
}

export const MobileAuthNavigator: React.FC<MobileAuthNavigatorProps> = ({ initialUrl }) => {
  const [screen, setScreen] = useState<ScreenState>('loading');
  const [currentUser, setCurrentUser] = useState<AppwriteUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Processes OAuth callback deep links:
   * Parses `userId` and `secret` query parameters and creates an Appwrite session.
   */
  const handleOAuthCallback = useCallback(async (urlString: string): Promise<void> => {
    try {
      setScreen('callback');
      const parsedUrl = new URL(urlString);
      const userId = parsedUrl.searchParams.get('userId');
      const secret = parsedUrl.searchParams.get('secret');

      if (!userId || !secret) {
        throw new Error('OAuth callback failed: Missing userId or secret parameter');
      }

      await account.createSession({ userId, secret });
      const user = await account.get();
      setCurrentUser(user);
      setErrorMessage(null);
      setScreen('dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process OAuth callback';
      setErrorMessage(message);
      setScreen('error');
    }
  }, []);

  /**
   * Auth Guard: Resolve initial auth state before rendering protected UI
   */
  useEffect(() => {
    let isMounted = true;

    async function resolveInitialAuthState(): Promise<void> {
      // If a callback URL with OAuth query parameters is provided
      if (initialUrl && (initialUrl.includes('secret=') || initialUrl.includes('userId='))) {
        await handleOAuthCallback(initialUrl);
        return;
      }

      // Check browser URL query params if running in web/hybrid container
      if (typeof window !== 'undefined' && window.location) {
        const queryParams = new URLSearchParams(window.location.search);
        const secret = queryParams.get('secret');
        const userId = queryParams.get('userId');
        if (secret && userId) {
          await handleOAuthCallback(window.location.href);
          return;
        }
      }

      // Standard Auth Guard Resolution: Check existing Appwrite session
      const user = await getCurrentUser();
      if (!isMounted) return;

      if (user) {
        setCurrentUser(user);
        setScreen('dashboard');
      } else {
        setCurrentUser(null);
        setScreen('auth');
      }
    }

    void resolveInitialAuthState();

    return () => {
      isMounted = false;
    };
  }, [initialUrl, handleOAuthCallback]);

  // Loading Screen: Resolves auth state before rendering protected UI
  if (screen === 'loading' || screen === 'callback') {
    return (
      <div
        data-testid="auth-loading-state"
        className="flex min-h-screen flex-col items-center justify-center bg-civic-950 text-civic-200"
      >
        <span className="w-10 h-10 border-4 border-civic-700 border-t-accent-default rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-civic-400">
          {screen === 'callback' ? 'Completing Google Sign in...' : 'Resolving authentication state...'}
        </p>
      </div>
    );
  }

  // Failure Path: Shows error and provides a way back to Auth
  if (screen === 'error') {
    return (
      <div
        data-testid="auth-error-state"
        className="flex min-h-screen flex-col items-center justify-center p-6 bg-civic-950 text-civic-100"
      >
        <div className="w-full max-w-md p-8 rounded-3xl bg-civic-900 border border-red-800/60 shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-700 flex items-center justify-center mx-auto text-red-400 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-red-200">Authentication Failed</h2>
          <p className="text-sm text-red-300/80">{errorMessage || 'An error occurred during sign in.'}</p>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setScreen('auth');
            }}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-civic-800 hover:bg-civic-700 text-civic-100 border border-civic-700 transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Screen: Protected Stack
  if (screen === 'dashboard') {
    return (
      <DashboardScreen
        initialUser={currentUser}
        onNavigateToAuth={() => {
          setCurrentUser(null);
          setScreen('auth');
        }}
      />
    );
  }

  // Auth Screen: Signed-out screen
  return (
    <AuthScreen
      onNavigateToDashboard={(user: AppwriteUser) => {
        setCurrentUser(user);
        setScreen('dashboard');
      }}
    />
  );
};
