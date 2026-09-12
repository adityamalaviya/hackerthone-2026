import React, { useState, useRef, useEffect } from 'react';
import { SignOut, Shield, Buildings, UserCircle, User } from '@phosphor-icons/react';
import { UserSession } from '../lib/appwrite';

interface NavbarProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  currentUser?: UserSession | null;
  onSignOut?: () => void;
  onOpenStaffPanel?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenReports?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  currentUser, 
  onSignOut,
  onOpenStaffPanel,
  onOpenAdminPanel,
  onOpenReports
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-civic-50/90 dark:bg-civic-950/90 backdrop-blur-md border-b border-civic-200 dark:border-civic-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-baseline gap-2 group">
            <span className="text-xl font-bold tracking-tight text-civic-950 group-hover:text-black dark:text-civic-50 dark:group-hover:text-white transition-colors">
              civicFix
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-2xs font-medium tracking-normal text-civic-600 bg-civic-100 dark:bg-civic-900 dark:text-civic-300 rounded-full border border-civic-200 dark:border-civic-800">
              <span className="w-1.5 h-1.5 rounded-full bg-status-resolved animate-pulse"></span>
              Gandhidham
            </span>
          </a>
        </div>

        {/* Center / Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-civic-600 dark:text-civic-400">
          <a href="#hero" className="text-civic-950 dark:text-civic-50 hover:text-black dark:hover:text-white transition-colors">
            Home
          </a>
          <a href="#map" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">
            Live Map
          </a>
          <a href="#how-it-works" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">
            How It Works
          </a>
          <a href="#categories" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">
            Categories
          </a>
          <a href="#track" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">
            Track Status
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {!currentUser ? (
            <button
              type="button"
              onClick={() => onOpenAuth?.('login')}
              className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-civic-950 hover:bg-black dark:bg-civic-100 dark:text-civic-950 dark:hover:bg-white rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Circular Avatar using unified civic tokens */}
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-accent/10 dark:bg-accent/20 border border-accent/30 text-accent shadow-sm hover:ring-2 hover:ring-accent/30 transition-all cursor-pointer focus:outline-none"
                title={currentUser.name}
                aria-label="User profile"
              >
                <User size={16} weight="bold" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-civic-900 rounded-xl shadow-xl border border-civic-200 dark:border-civic-800 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* User info banner */}
                  <div className="px-4 py-3 border-b border-civic-100 dark:border-civic-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/10 dark:bg-accent/20 border border-accent/30 text-accent flex items-center justify-center flex-shrink-0">
                      <User size={16} weight="bold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-civic-900 dark:text-civic-100 truncate">{currentUser.name}</p>
                      <p className="text-2xs text-civic-500 dark:text-civic-400 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-medium uppercase tracking-wide bg-civic-100 dark:bg-civic-800 text-civic-700 dark:text-civic-300">
                          {currentUser.role}
                        </span>
                        {currentUser.ward && (
                          <span className="text-3xs text-civic-500 dark:text-civic-400 font-medium">
                            • {currentUser.ward}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    {currentUser.role === 'admin' && onOpenAdminPanel && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenAdminPanel();
                        }}
                        className="w-full text-left px-4 py-2 text-civic-700 dark:text-civic-300 hover:bg-civic-50 dark:hover:bg-civic-800 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                      >
                        <Shield size={15} className="text-accent" />
                        <span className="text-accent font-semibold">Super Admin Panel</span>
                      </button>
                    )}

                    {currentUser.role === 'staff' && onOpenStaffPanel && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenStaffPanel();
                        }}
                        className="w-full text-left px-4 py-2 text-civic-700 dark:text-civic-300 hover:bg-civic-50 dark:hover:bg-civic-800 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                      >
                        <Buildings size={15} className="text-civic-500 dark:text-civic-400" />
                        <span>Staff Workstation</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onOpenReports) {
                          onOpenReports();
                        } else {
                          window.location.hash = '#track';
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-civic-700 dark:text-civic-300 hover:bg-civic-50 dark:hover:bg-civic-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <UserCircle size={15} className="text-civic-500 dark:text-civic-400" />
                      <span>My Reports & Activity</span>
                    </button>
                  </div>

                  <div className="border-t border-civic-100 dark:border-civic-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onSignOut?.();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                    >
                      <SignOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
