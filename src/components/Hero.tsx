import React, { useState } from 'react';
import { ArrowRight, MapPin, Camera, ShieldCheck } from '@phosphor-icons/react';
import { UserSession } from '../lib/appwrite';

const HEADLINE_OPTIONS = [
  "Spot it. Report it. See it fixed in Gandhidham.",
  "Your direct line to Gandhidham municipal action.",
  "Civic accountability in seconds, not months."
];

interface HeroProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  currentUser?: UserSession | null;
  onReportIssue?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth: _onOpenAuth, currentUser: _currentUser, onReportIssue }) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  const handleReportClick = (): void => {
    onReportIssue?.();
  };

  return (
    <section id="hero" className="pt-16 pb-14 md:pt-24 md:pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="max-w-3xl">
        
        {/* Coverage pill */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-6 text-xs font-medium text-civic-700 bg-civic-100/90 border border-civic-200 dark:text-civic-300 dark:bg-civic-900/90 dark:border-civic-800 rounded-lg">
          <MapPin size={13} weight="fill" className="text-accent" />
          <span>Gandhidham & Adipur Municipal Jurisdiction • Ward 1–6</span>
        </div>

        {/* Confident Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter text-civic-950 dark:text-civic-50 leading-tightest mb-6">
          {HEADLINE_OPTIONS[headlineIndex]}
        </h1>

        {/* Headline selector switcher for demo versatility */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xs font-mono uppercase tracking-wider text-civic-600 dark:text-civic-400">Headline option:</span>
          {HEADLINE_OPTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeadlineIndex(idx)}
              className={`text-xs px-2 py-0.5 rounded-md transition-all font-mono cursor-pointer ${
                headlineIndex === idx 
                  ? 'bg-civic-950 text-white dark:bg-civic-100 dark:text-civic-950 font-semibold shadow-xs' 
                  : 'bg-civic-100 text-civic-600 hover:bg-civic-200 dark:bg-civic-800 dark:text-civic-300 dark:hover:bg-civic-700'
              }`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>

        {/* Concise Subtext */}
        <p className="text-base sm:text-lg text-civic-600 dark:text-civic-300 leading-relaxed font-normal mb-8 max-w-2xl">
          Report road craters, malfunctioning streetlights, and drainage blocks directly to the Gandhidham municipality. Auto-detected GPS coordinates, instant municipal ward routing, and public resolution tracking.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 mb-10">
          <button
            type="button"
            onClick={handleReportClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Camera size={18} weight="bold" />
            <span>Report an Issue</span>
          </button>

          <a
            href="#map"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-civic-800 bg-white hover:bg-civic-50 border border-civic-200 dark:text-civic-200 dark:bg-civic-900 dark:hover:bg-civic-800 dark:border-civic-700 rounded-lg shadow-xs transition-all duration-150"
          >
            <span>View Live Issue Map</span>
            <ArrowRight size={15} weight="bold" className="text-civic-500 dark:text-civic-400" />
          </a>
        </div>

        {/* Trust Signals & Public Guarantee */}
        <div className="pt-6 border-t border-civic-200/80 dark:border-civic-800 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-civic-500 dark:text-civic-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} weight="duotone" className="text-status-resolved" />
            <span>Verified Citizen & Officer Portal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-civic-400 dark:bg-civic-600"></span>
            <span>Public audit trail for all wards</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-civic-400 dark:bg-civic-600"></span>
            <span>SMS updates on resolution</span>
          </div>
        </div>

      </div>
    </section>
  );
};
