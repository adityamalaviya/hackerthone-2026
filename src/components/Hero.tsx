import React, { useState } from 'react';
import { ArrowRight, MapPin, Camera, ShieldCheck } from '@phosphor-icons/react';

const HEADLINE_OPTIONS = [
  "Spot it. Report it. See it fixed in Gandhidham.",
  "Your direct line to Gandhidham municipal action.",
  "Civic accountability in seconds, not months."
];

interface HeroProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  return (
    <section id="hero" className="pt-16 pb-14 md:pt-24 md:pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="max-w-3xl">
        
        {/* Coverage pill */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-6 text-xs font-medium text-civic-700 bg-civic-100/90 border border-civic-200 rounded-md">
          <MapPin size={13} weight="fill" className="text-accent" />
          <span>Gandhidham & Adipur Municipal Jurisdiction • Ward 1–6</span>
        </div>

        {/* Confident Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter text-civic-950 leading-[1.08] mb-6">
          {HEADLINE_OPTIONS[headlineIndex]}
        </h1>

        {/* Headline selector switcher for demo versatility */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-civic-600">Headline option:</span>
          {HEADLINE_OPTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeadlineIndex(idx)}
              className={`text-xs px-2 py-0.5 rounded transition-all font-mono ${
                headlineIndex === idx 
                  ? 'bg-civic-900 text-white font-semibold' 
                  : 'bg-civic-100 text-civic-600 hover:bg-civic-200'
              }`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>

        {/* Concise Subtext */}
        <p className="text-base sm:text-lg text-civic-600 leading-relaxed font-normal mb-8 max-w-2xl">
          Report road craters, malfunctioning streetlights, and drainage blocks directly to the Gandhidham municipality. Auto-detected GPS coordinates, instant municipal ward routing, and public resolution tracking.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 mb-10">
          <button
            type="button"
            onClick={() => onOpenAuth?.('register')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-md shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <Camera size={18} weight="bold" />
            <span>Report an Issue</span>
          </button>

          <a
            href="#map"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-civic-800 bg-white hover:bg-civic-50 border border-civic-200 rounded-md transition-all duration-150 hover:border-civic-300 active:scale-[0.98]"
          >
            <span>View Live Issue Map</span>
            <ArrowRight size={15} weight="bold" className="text-civic-500" />
          </a>
        </div>

        {/* Trust Signals & Public Guarantee */}
        <div className="pt-6 border-t border-civic-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-civic-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} weight="duotone" className="text-emerald-700" />
            <span>No citizen account needed to report</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-civic-400"></span>
            <span>Public audit trail for all wards</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-civic-400"></span>
            <span>SMS updates on resolution</span>
          </div>
        </div>

      </div>
    </section>
  );
};
