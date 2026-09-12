import React, { useEffect, useState } from 'react';
import { signOut, AppwriteUser, account } from '../../lib/appwriteMobile';

export interface DashboardScreenProps {
  initialUser?: AppwriteUser | null;
  onNavigateToAuth: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  initialUser = null,
  onNavigateToAuth,
}) => {
  const [user, setUser] = useState<AppwriteUser | null>(initialUser);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isVerifying, setIsVerifying] = useState(!initialUser);

  // Auth Guard: Dashboard stack awaits account.get(). If it fails, navigate to Auth.
  useEffect(() => {
    let isMounted = true;

    async function verifySession(): Promise<void> {
      try {
        const currentUser = await account.get();
        if (isMounted) {
          setUser(currentUser);
          setIsVerifying(false);
        }
      } catch {
        if (isMounted) {
          onNavigateToAuth();
        }
      }
    }

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, [onNavigateToAuth]);

  const handleSignOut = async (): Promise<void> => {
    try {
      setIsSigningOut(true);
      await signOut();
      onNavigateToAuth();
    } catch {
      // Force return to Auth on sign out error
      onNavigateToAuth();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-civic-950 text-civic-200">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-civic-600 border-t-accent-default rounded-full animate-spin" />
          <p className="text-sm text-civic-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.email || 'Authenticated User';

  return (
    <div className="flex min-h-screen flex-col bg-civic-950 text-civic-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Header / Top Bar */}
        <header className="flex items-center justify-between pb-6 border-b border-civic-800">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-accent-default">
              CivicFix Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-civic-50 mt-1">
              Welcome, {displayName}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-civic-800 hover:bg-civic-700 text-civic-200 border border-civic-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            aria-label="Sign out"
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </header>

        {/* Dashboard Profile Card */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl bg-civic-900 border border-civic-800 space-y-4">
            <h2 className="text-lg font-semibold text-civic-200">Account Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-civic-500 uppercase font-medium">User ID</dt>
                <dd className="font-mono text-civic-300 break-all">{user?.$id ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-civic-500 uppercase font-medium">Full Name</dt>
                <dd className="text-civic-200">{user?.name || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs text-civic-500 uppercase font-medium">Email Address</dt>
                <dd className="text-civic-200">{user?.email || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs text-civic-500 uppercase font-medium">OAuth Provider</dt>
                <dd className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                  Google OAuth2 (Active)
                </dd>
              </div>
            </dl>
          </section>

          <section className="p-6 rounded-2xl bg-civic-900 border border-civic-800 space-y-4">
            <h2 className="text-lg font-semibold text-civic-200">Session Status</h2>
            <p className="text-sm text-civic-400">
              Your Appwrite OAuth session is authenticated. You can browse civic issues or register new reports for Gandhidham.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-800/60 transition-colors"
              >
                Sign out of all devices
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
