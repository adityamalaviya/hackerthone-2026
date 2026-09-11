import React, { useState, useRef, useEffect } from 'react';
import { CaretRight, SignOut, Shield, Buildings, UserCircle } from '@phosphor-icons/react';
import { UserSession } from '../lib/appwrite';

interface NavbarProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  currentUser?: UserSession | null;
  onSignOut?: () => void;
  onOpenStaffPanel?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  currentUser, 
  onSignOut,
  onOpenStaffPanel,
  onOpenAdminPanel
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
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-civic-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-baseline gap-2 group">
            <span className="text-xl font-bold tracking-tight text-civic-950 group-hover:text-black transition-colors">
              civicFix
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium tracking-normal text-civic-600 bg-civic-100 rounded-full border border-civic-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gandhidham
            </span>
          </a>
        </div>

        {/* Center / Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-civic-600">
          <a href="#hero" className="text-civic-950 hover:text-black transition-colors">
            Home
          </a>
          <a href="#map" className="hover:text-civic-950 transition-colors">
            Live Map
          </a>
          <a href="#how-it-works" className="hover:text-civic-950 transition-colors">
            How It Works
          </a>
          <a href="#categories" className="hover:text-civic-950 transition-colors">
            Categories
          </a>
          <a href="#track" className="hover:text-civic-950 transition-colors">
            Track Status
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {!currentUser ? (
            <>
              <button 
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="hidden sm:inline-flex items-center gap-1 text-[12.5px] font-medium text-civic-500 hover:text-civic-800 transition-colors px-1 cursor-pointer"
              >
                <span>Authority Portal</span>
                <CaretRight size={12} weight="bold" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-civic-900 hover:bg-black rounded-md shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Sign In
              </button>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Circular Avatar matching provided design */}
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#E6F7F5] border border-[#B3EAE3] shadow-sm hover:ring-2 hover:ring-[#0D9488]/30 transition-all cursor-pointer focus:outline-none"
                title={currentUser.name}
                aria-label="User profile"
              >
                {/* Outer concentric subtle accent ring */}
                <div className="w-7 h-7 rounded-full border-2 border-[#0D9488] flex items-center justify-center overflow-hidden">
                  {/* Inner User icon with teal silhouette */}
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-5 h-5 text-[#0D9488] mt-0.5"
                  >
                    <path fillRule="evenodd" d="M12 2.5a4.25 4.25 0 100 8.5 4.25 4.25 0 000-8.5zm-6.25 14.5a6.25 6.25 0 0112.5 0v.5a.75.75 0 01-.75.75h-11a.75.75 0 01-.75-.75v-.5z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-civic-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* User info banner */}
                  <div className="px-4 py-3 border-b border-civic-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E6F7F5] border border-[#B3EAE3] flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#0D9488]">
                        <path fillRule="evenodd" d="M12 2.5a4.25 4.25 0 100 8.5 4.25 4.25 0 000-8.5zm-6.25 14.5a6.25 6.25 0 0112.5 0v.5a.75.75 0 01-.75.75h-11a.75.75 0 01-.75-.75v-.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-civic-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-civic-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium uppercase tracking-wide bg-civic-100 text-civic-700">
                          {currentUser.role}
                        </span>
                        {currentUser.ward && (
                          <span className="text-[10px] text-civic-500 font-medium">
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
                        className="w-full text-left px-4 py-2 text-civic-700 hover:bg-civic-50 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                      >
                        <Shield size={15} className="text-amber-600" />
                        <span className="text-amber-700 font-semibold">Super Admin Panel</span>
                      </button>
                    )}

                    {currentUser.role === 'staff' && onOpenStaffPanel && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenStaffPanel();
                        }}
                        className="w-full text-left px-4 py-2 text-civic-700 hover:bg-civic-50 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                      >
                        <Buildings size={15} className="text-civic-500" />
                        <span>Staff Workstation</span>
                      </button>
                    )}

                    <a
                      href="#track"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-civic-700 hover:bg-civic-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <UserCircle size={15} className="text-civic-500" />
                      <span>My Reports & Activity</span>
                    </a>
                  </div>

                  <div className="border-t border-civic-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onSignOut?.();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors font-medium"
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
