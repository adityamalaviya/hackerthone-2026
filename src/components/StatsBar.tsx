import React from 'react';

const STATS = [
  {
    value: '1,420+',
    label: 'Civic Issues Logged',
    subtext: 'Across Gandhidham & Adipur',
  },
  {
    value: '88.4%',
    label: 'Resolution Rate',
    subtext: 'Verified by photo audits',
  },
  {
    value: '36 hrs',
    label: 'Avg. Turnaround',
    subtext: 'From report to site crew fix',
  },
  {
    value: '6 Wards',
    label: 'Active Municipal Coverage',
    subtext: '100% jurisdictional reach',
  },
];

export const StatsBar: React.FC = () => {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-civic-200">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-civic-950 font-sans">
              {stat.value}
            </span>
            <span className="text-xs sm:text-sm font-medium text-civic-800 mt-2">
              {stat.label}
            </span>
            <span className="text-[11.5px] text-civic-500 mt-0.5 font-normal">
              {stat.subtext}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
