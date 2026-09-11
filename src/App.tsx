import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MapPreview } from './components/MapPreview';
import { HowItWorks } from './components/HowItWorks';
import { StatusStepper } from './components/StatusStepper';
import { StatsBar } from './components/StatsBar';
import { CategoryGrid } from './components/CategoryGrid';
import { Footer } from './components/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { UserSession, authService } from './lib/appwrite';
import { StaffPanel } from './components/staff/StaffPanel';
import { StaffDepartment } from './features/staff/types';
import { AdminPanel } from './components/admin';

export const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => authService.getCurrentSession());
  const [staffViewMode, setStaffViewMode] = useState<'staff' | 'citizen'>('staff');
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'citizen'>('admin');
  const [demoAdminActive, setDemoAdminActive] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.search.includes('view=admin');
  });

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
  };

  // If authenticated as admin (or in evaluator demo mode) and in admin view mode, render the Admin Panel
  if ((currentUser?.role === 'admin' && adminViewMode === 'admin') || demoAdminActive) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-civic-900 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
        <AdminPanel
          currentUser={currentUser}
          onLogout={handleSignOut}
          onSwitchToCitizenView={() => {
            setAdminViewMode('citizen');
            setDemoAdminActive(false);
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
      <div className="min-h-screen bg-[#FAF9F6] text-civic-900 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
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
    <div className="min-h-screen bg-[#FAF9F6] text-civic-900 selection:bg-accent/15 selection:text-accent flex flex-col font-sans">
      {/* Quick Demo Switcher Bar for Hackathon Evaluators */}
      <div className="bg-civic-950 text-white text-[11px] py-1.5 px-4 border-b border-civic-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-civic-400">DEMO SUITE:</span>
            <span className="text-civic-200">Gandhidham CivicFix Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                const session = await authService.login('staff@civicfix.gov.in', 'staff123');
                setCurrentUser(session);
                setStaffViewMode('staff');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Launch Staff Workstation →
            </button>
            <span className="text-civic-700">|</span>
            <button
              onClick={() => setDemoAdminActive(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Launch Super Admin Panel →
            </button>
          </div>
        </div>
      </div>

      <Navbar 
        onOpenAuth={handleOpenAuth} 
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenStaffPanel={() => setStaffViewMode('staff')}
        onOpenAdminPanel={() => setAdminViewMode('admin')}
      />

      <main className="flex-1">
        <Hero onOpenAuth={handleOpenAuth} />
        <MapPreview />
        <HowItWorks />
        <StatusStepper />
        <StatsBar />
        <CategoryGrid />
      </main>
      
      <Footer />

      {/* Auth Modal with Login and Register Cards */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
