import React from 'react';
import { Check, Clock, Gear, ThumbsUp, Archive } from '@phosphor-icons/react';

const STAGES = [
  {
    name: 'Reported',
    desc: 'Incident logged with GPS & photo by citizen',
    icon: Check,
    active: true,
    statusText: 'Logged'
  },
  {
    name: 'Acknowledged',
    desc: 'Ward supervisor verifies ticket & priority',
    icon: Clock,
    active: true,
    statusText: 'Verified'
  },
  {
    name: 'In Progress',
    desc: 'Ground repair crew dispatched with equipment',
    icon: Gear,
    active: true,
    statusText: 'Active Crew'
  },
  {
    name: 'Resolved',
    desc: 'Fix completed + after-photo audit uploaded',
    icon: ThumbsUp,
    active: true,
    statusText: 'Audit Approved'
  },
  {
    name: 'Closed',
    desc: 'Citizen confirmation & public archive entry',
    icon: Archive,
    active: false,
    statusText: 'Archived'
  },
];

export const StatusStepper: React.FC = () => {
  return (
    <section id="track" className="py-14 md:py-18 px-4 sm:px-6 max-w-6xl mx-auto border-t border-civic-200 dark:border-civic-800">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10">
        <div>
          <span className="text-2xs font-mono uppercase tracking-wider text-civic-500 dark:text-civic-400 block mb-1">
            Transparency Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-civic-950 dark:text-civic-50">
            Public Status Stepper
          </h2>
        </div>
        <p className="text-xs text-civic-500 dark:text-civic-400 font-mono mt-2 sm:mt-0">
          Auditable timeline • Average cycle: 36h
        </p>
      </div>

      {/* Stepper Visualization */}
      <div className="bg-white dark:bg-civic-900 rounded-xl border border-civic-200 dark:border-civic-800 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative">
          
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isLast = idx === STAGES.length - 1;

            return (
              <div key={stage.name} className="relative flex flex-col">
                
                {/* Connecting bar for desktop */}
                {!isLast && (
                  <div className="hidden md:block absolute top-3.5 left-7 w-full h-0.5 bg-civic-200 dark:bg-civic-800 z-0" />
                )}

                {/* Step indicator node */}
                <div className="flex items-center gap-3 mb-3 z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    stage.active 
                      ? 'bg-civic-950 text-white dark:bg-civic-100 dark:text-civic-950 shadow-sm' 
                      : 'bg-civic-100 text-civic-400 dark:bg-civic-800 dark:text-civic-500 border border-civic-200 dark:border-civic-700'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="md:hidden text-xs font-semibold text-civic-900 dark:text-civic-100">
                    {stage.name}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="hidden md:block text-xs font-semibold text-civic-950 dark:text-civic-100 mb-1">
                    {stage.name}
                  </h4>
                  <p className="text-2xs text-civic-500 dark:text-civic-400 leading-relaxed">
                    {stage.desc}
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-3xs font-mono text-civic-600 dark:text-civic-300 bg-civic-50 dark:bg-civic-800 px-2 py-0.5 rounded border border-civic-200/80 dark:border-civic-700">
                    <Icon size={10} weight="bold" className="text-accent" />
                    <span>{stage.statusText}</span>
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </section>
  );
};
