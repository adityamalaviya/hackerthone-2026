import React, { useEffect, useState } from 'react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { signInWithProvider, getCurrentUser, AppwriteUser } from '../../lib/appwriteMobile';

export interface AuthScreenProps {
  onNavigateToDashboard: (user: AppwriteUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onNavigateToDashboard }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth Guard: If already authenticated, navigate to Dashboard
  useEffect(() => {
    let isMounted = true;
    async function checkAuth(): Promise<void> {
      const user = await getCurrentUser();
      if (user && isMounted) {
        onNavigateToDashboard(user);
      }
    }
    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [onNavigateToDashboard]);

  const handleSignIn = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithProvider();
      const user = await getCurrentUser();
      if (user) {
        onNavigateToDashboard(user);
      } else {
        throw new Error('Session created but failed to load user profile');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-civic-950 text-civic-100">
      <div className="w-full max-w-md p-8 rounded-3xl bg-civic-900 border border-civic-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-civic-50">Welcome to CivicFix</h1>
          <p className="text-sm text-civic-400">
            Sign in with your Google account to access civic services and report issues.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-sm space-y-1"
          >
            <div className="font-semibold flex items-center gap-1.5">
              <span>Authentication Error</span>
            </div>
            <p className="text-xs text-red-300/90">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mt-2 text-xs font-semibold text-red-200 underline hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        <div className="pt-2">
          <GoogleSignInButton
            onPress={handleSignIn}
            isLoading={isLoading}
            disabled={isLoading}
          />
        </div>

        <div className="text-center text-xs text-civic-500">
          <span>Protected by Appwrite OAuth2 authentication</span>
        </div>
      </div>
    </div>
  );
};
