import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MapPreview } from './components/MapPreview';
import { HowItWorks } from './components/HowItWorks';
import { StatusStepper } from './components/StatusStepper';
import { StatsBar } from './components/StatsBar';
import { CategoryGrid } from './components/CategoryGrid';
import { Footer } from './components/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { UserSession, authService, syncAppwriteSession } from './lib/appwrite';
import { StaffPanel } from './components/staff/StaffPanel';
import { StaffDepartment } from './features/staff/types';
import { AdminPanel } from './components/admin';
import {
  AuthPage,
  OAuthSuccessPage,
  OAuthFailurePage,
} from './pages';
import { ReportActivityPage } from './ReportActivityPage';
import { ShieldCheck, Camera } from '@phosphor-icons/react';
import { ReportIssueModal } from './components/report/ReportIssueModal';
import { CivicCategory } from './types/admin';

export const App: React.FC = (): React.JSX.Element => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => authService.getCurrentSession());
  const [staffViewMode, setStaffViewMode] = useState<'staff' | 'citizen'>('staff');
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'citizen'>('admin');
  const [citizenViewMode, setCitizenViewMode] = useState<'home' | 'reports'>('home');
  const [isReportModalOpen, setIsReportModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/report' || window.location.pathname === '/report/';
    }
    return false;
  });
  const [reportCategory, setReportCategory] = useState<CivicCategory>('Pothole');

  const handleOpenReportModal = (cat?: CivicCategory) => {
    if (cat) {
      setReportCategory(cat);
    }
    setIsReportModalOpen(true);
  };

  useEffect(() => {
    const handlePopState = (): void => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return (): void => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync existing Appwrite session on mount if safeStorage is unhydrated
  useEffect(() => {
    if (!currentUser) {
      void syncAppwriteSession().then((session) => {
        if (session) {
          setCurrentUser(session);
        }
      });
    }
  }, [currentUser]);

  // First-party route dispatching
  if (currentPath === '/auth' || currentPath === '/auth/') {
    return <AuthPage />;
  }

  if (currentPath === '/auth/success' || currentPath === '/auth/success/') {
    return <OAuthSuccessPage />;
  }

  if (currentPath === '/auth/failure' || currentPath === '/auth/failure/') {
    return <OAuthFailurePage />;
  }

  // Redirect /dashboard to home page
  if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
    if (typeof window !== 'undefined' && window.location) {
      window.location.replace('/');
    }
    return <div className="min-h-screen bg-civic-50 dark:bg-civic-950" />;
  }

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (session: UserSession) => {
    setCurrentUser(session);
    if (session.role === 'staff') {
      setStaffViewMode('staff');
    }
    if (session.role === 'admin') {
      setAdminViewMode('admin');
    }
  };

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    setCitizenViewMode('home');
  };

  // Reports & Activity view (takes precedence when explicitly navigated to /reports, /activity, or citizenViewMode is 'reports')
  if (currentPath === '/reports' || currentPath === '/reports/' || currentPath === '/activity' || citizenViewMode === 'reports') {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
          <Navbar 
            onOpenAuth={handleOpenAuth} 
            currentUser={currentUser}
            onSignOut={handleSignOut}
            onOpenStaffPanel={() => setStaffViewMode('staff')}
            onOpenAdminPanel={() => setAdminViewMode('admin')}
            onOpenReports={() => setCitizenViewMode('reports')}
            onOpenReportIssue={() => handleOpenReportModal()}
          />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full p-8 bg-white border border-civic-200 dark:bg-civic-900 dark:border-civic-800 rounded-xl text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center mx-auto mb-4 text-accent">
                <ShieldCheck size={26} />
              </div>
              <h2 className="text-lg font-semibold text-civic-950 dark:text-civic-50 mb-2">
                Authentication Required
              </h2>
              <p className="text-xs text-civic-600 dark:text-civic-400 mb-6 leading-relaxed">
                My Reports &amp; Activity is a protected citizen portal. Please sign in or create an account to view and track your filed civic reports.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-950 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCitizenViewMode('home');
                    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                      window.history.pushState({}, '', '/');
                      setCurrentPath('/');
                    }
                  }}
                  className="px-4 py-2 text-xs font-medium text-civic-700 bg-civic-100 hover:bg-civic-200 dark:bg-civic-800 dark:text-civic-300 rounded-lg transition-all cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </main>
          <Footer />
          <AuthModal
            isOpen={isAuthOpen}
            initialMode={authMode}
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
          <ReportIssueModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            currentUser={currentUser}
            initialCategory={reportCategory}
            onViewReports={() => setCitizenViewMode('reports')}
            onViewMap={() => {
              setCitizenViewMode('home');
              setTimeout(() => {
                const mapEl = document.getElementById('map');
                if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
        <Navbar 
          onOpenAuth={handleOpenAuth} 
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onOpenStaffPanel={() => setStaffViewMode('staff')}
          onOpenAdminPanel={() => setAdminViewMode('admin')}
          onOpenReports={() => setCitizenViewMode('reports')}
          onOpenReportIssue={() => handleOpenReportModal()}
        />
        <main className="flex-1">
          <ReportActivityPage
            onBack={() => {
              setCitizenViewMode('home');
              if (typeof window !== 'undefined' && window.location.pathname !== '/') {
                window.history.pushState({}, '', '/');
                setCurrentPath('/');
              }
            }}
            onReportIssue={() => handleOpenReportModal()}
          />
        </main>
        <Footer />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
        <ReportIssueModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          currentUser={currentUser}
          initialCategory={reportCategory}
          onViewReports={() => setCitizenViewMode('reports')}
          onViewMap={() => {
            setCitizenViewMode('home');
            setTimeout(() => {
              const mapEl = document.getElementById('map');
              if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }}
        />
      </div>
    );
  }

  // If authenticated as admin and in admin view mode, render the Admin Panel
  if (currentUser?.role === 'admin' && adminViewMode === 'admin') {
    return (
      <div className="min-h-screen bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
        <AdminPanel
          currentUser={currentUser}
          onLogout={handleSignOut}
          onSwitchToCitizenView={() => {
            setAdminViewMode('citizen');
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // If authenticated as municipal staff and in staff view mode, render the dedicated Staff Panel
  if (currentUser?.role === 'staff' && staffViewMode === 'staff') {
    return (
      <div className="min-h-screen bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
        <StaffPanel
          userDepartment={(currentUser.department as StaffDepartment) || 'Roads & Infrastructure'}
          staffName={currentUser.name}
          staffId={currentUser.id}
          onSignOut={handleSignOut}
          onToggleViewMode={() => setStaffViewMode('citizen')}
        />

        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-civic-50 dark:bg-civic-950 text-civic-900 dark:text-civic-100 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
      <Navbar 
        onOpenAuth={handleOpenAuth} 
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenStaffPanel={() => setStaffViewMode('staff')}
        onOpenAdminPanel={() => setAdminViewMode('admin')}
        onOpenReports={() => setCitizenViewMode('reports')}
        onOpenReportIssue={() => handleOpenReportModal()}
      />

      <main className="flex-1">
        <Hero
          onOpenAuth={handleOpenAuth}
          currentUser={currentUser}
          onReportIssue={() => handleOpenReportModal()}
        />
        <MapPreview />
        <HowItWorks />
        <StatusStepper />
        <StatsBar />
        <CategoryGrid
          onReportCategory={(cat) => handleOpenReportModal(cat)}
        />
      </main>
      
      <Footer />

      {/* Floating Action Button (FAB) for Instant Problem Reporting */}
      <button
        type="button"
        onClick={() => handleOpenReportModal()}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 group"
        aria-label="Report a Civic Problem"
      >
        <Camera size={18} weight="bold" className="group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Report Problem</span>
      </button>

      {/* Auth Modal with Login and Register Cards */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Civic Problem Reporting Modal with Photo Upload & Location Detection */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        initialCategory={reportCategory}
        onViewReports={() => {
          setCitizenViewMode('reports');
          if (typeof window !== 'undefined' && window.location.pathname !== '/reports') {
            window.history.pushState({}, '', '/reports');
            setCurrentPath('/reports');
          }
        }}
        onViewMap={() => {
          setCitizenViewMode('home');
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
          }
          setTimeout(() => {
            const mapEl = document.getElementById('map');
            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
      />
    </div>
  );
};

export default App;
