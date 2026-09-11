import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, User } from '@phosphor-icons/react';
import { LoginCard } from './LoginCard';
import { UserSession, authService } from '../../lib/appwrite';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess?: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}): React.JSX.Element | null => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [activeSession, setActiveSession] = useState<UserSession | null>(() => authService.getCurrentSession());
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sync mode if initialMode changes
  React.useEffect((): void => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSuccess = (session: UserSession): void => {
    setActiveSession(session);
    const roleLabel = session.role === 'admin' ? 'Super Admin' : session.role === 'staff' ? 'Municipal Staff' : 'Citizen';
    setSuccessBanner(`Signed in successfully as ${session.name} (${roleLabel})`);

    if (onAuthSuccess) {
      onAuthSuccess(session);
    }

    // Auto close after brief celebration feedback
    setTimeout((): void => {
      setSuccessBanner(null);
      onClose();
    }, 1200);
  };

  const handleLogout = (): void => {
    authService.logout();
    setActiveSession(null);
    setSuccessBanner('You have logged out.');
    setTimeout((): void => setSuccessBanner(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-civic-950/45 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Container with responsive positioning */}
      <div className="relative my-auto w-full flex justify-center py-6">
        
        {/* Close button at top right */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute -top-3 right-0 sm:right-6 md:right-10 z-10 p-2 text-civic-500 hover:text-civic-900 bg-white/90 hover:bg-white rounded-full shadow-md transition-all active:scale-95"
        >
          <X size={18} weight="bold" />
        </button>

        {/* Success toast overlay if authenticated */}
        {successBanner && (
          <div className="absolute top-2 z-20 px-4 py-2.5 bg-emerald-900 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle size={18} weight="fill" className="text-emerald-400" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* If already logged in, show quick profile & role switcher badge */}
        {activeSession && !successBanner ? (
          <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-civic-200 text-center">
            <div className="w-12 h-12 rounded-full bg-civic-100 border border-civic-200 mx-auto flex items-center justify-center text-civic-800 mb-4">
              <User size={24} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-civic-950">Active Session</h2>
            <p className="text-xs text-civic-500 mt-1">{activeSession.email}</p>

            <div className="mt-5 p-3 rounded-2xl bg-civic-50 border border-civic-200/80 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-civic-500 uppercase tracking-wider font-semibold text-[10px]">Name:</span>
                <span className="font-medium text-civic-900">{activeSession.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-civic-500 uppercase tracking-wider font-semibold text-[10px]">Role:</span>
                <span className="inline-flex items-center gap-1 font-semibold capitalize px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent border border-accent/20">
                  <ShieldCheck size={12} weight="fill" />
                  {activeSession.role}
                </span>
              </div>
              {activeSession.ward && (
                <div className="flex justify-between">
                  <span className="text-civic-500 uppercase tracking-wider font-semibold text-[10px]">Ward / Area:</span>
                  <span className="text-civic-700 font-normal">{activeSession.ward}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-civic-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Continue to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Seamless Switch between Login and Register in place with equal width and rhythm */
          <div className="w-full flex justify-center transform transition-all duration-300">
            <LoginCard
              initialMode={mode}
              onSwitchToRegister={() => setMode('register')}
              onSwitchToLogin={() => setMode('login')}
              onSuccess={handleSuccess}
            />
          </div>
        )}

      </div>
    </div>
  );
};
