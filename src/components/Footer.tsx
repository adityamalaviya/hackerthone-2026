import React from 'react';
import { Shield, ArrowUpRight } from '@phosphor-icons/react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-civic-200 dark:border-civic-800 bg-civic-50 dark:bg-civic-950 py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-civic-200 dark:border-civic-800 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-civic-950 dark:text-civic-50">
                civicFix
              </span>
              <span className="text-2xs text-civic-400 dark:text-civic-500 font-mono">/ gandhidham</span>
            </div>
            <p className="text-xs text-civic-600 dark:text-civic-400 mt-1 max-w-sm">
              Public Utility Platform for Municipal Ward Maintenance, Gandhidham, Kutch, Gujarat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-civic-600 dark:text-civic-400">
            <a href="#about" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">About System</a>
            <a href="#coverage" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">Wards (1–6)</a>
            <a href="#contact" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">Emergency Dispatch</a>
            <a href="#privacy" className="hover:text-civic-950 dark:hover:text-civic-100 transition-colors">Public Data Ethics</a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-civic-500 dark:text-civic-400">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-civic-400 dark:text-civic-500" />
            <span>Built for the 2026 Civic Innovation Hackathon • Open Municipal Interface</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Coverage: Gandhidham, Kutch (23.0784° N, 70.1337° E)</span>
            <a 
              href="#authority-login" 
              className="font-medium text-civic-700 dark:text-civic-300 hover:text-civic-950 dark:hover:text-white underline underline-offset-2 flex items-center gap-0.5 transition-colors"
            >
              <span>Authority Login</span>
              <ArrowUpRight size={11} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
