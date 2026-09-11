import React from 'react';
import { Shield, ArrowUpRight } from '@phosphor-icons/react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-civic-200 bg-[#FAF9F6] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-civic-200 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-civic-950">
                civicFix
              </span>
              <span className="text-xs text-civic-400 font-mono">/ gandhidham</span>
            </div>
            <p className="text-xs text-civic-600 mt-1 max-w-sm">
              Public Utility Platform for Municipal Ward Maintenance, Gandhidham, Kutch, Gujarat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-civic-600">
            <a href="#about" className="hover:text-civic-950 transition-colors">About System</a>
            <a href="#coverage" className="hover:text-civic-950 transition-colors">Wards (1–6)</a>
            <a href="#contact" className="hover:text-civic-950 transition-colors">Emergency Dispatch</a>
            <a href="#privacy" className="hover:text-civic-950 transition-colors">Public Data Ethics</a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] text-civic-500">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-civic-400" />
            <span>Built for the 2026 Civic Innovation Hackathon • Open Municipal Interface</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Coverage: Gandhidham, Kutch (23.0784° N, 70.1337° E)</span>
            <a 
              href="#authority-login" 
              className="font-medium text-civic-700 hover:text-civic-950 underline underline-offset-2 flex items-center gap-0.5"
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
