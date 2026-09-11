import React from 'react';
import { Camera, NavigationArrow, Tag, ChartLineUp } from '@phosphor-icons/react';

const STEPS = [
  {
    step: '01',
    title: 'Snap a ground photo',
    description: 'Capture the civic defect directly from your phone camera or gallery. No complex forms.',
    icon: Camera,
  },
  {
    step: '02',
    title: 'Auto-detect GPS coordinates',
    description: 'Pinpointed precisely within Gandhidham municipal boundaries with satellite accuracy.',
    icon: NavigationArrow,
  },
  {
    step: '03',
    title: 'Pick civic category',
    description: 'Tag as road, light, garbage, or water. Dispatches directly to the assigned ward engineer.',
    icon: Tag,
  },
  {
    step: '04',
    title: 'Track until resolved',
    description: 'Follow stage-by-stage proof of work: from dispatch to photo-verified resolution.',
    icon: ChartLineUp,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-14 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-civic-200">
      
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-mono uppercase tracking-wider text-civic-500 block mb-1.5">
          Workflow
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-civic-950">
          Takes under 30 seconds to report.
        </h2>
        <p className="text-sm text-civic-600 mt-2">
          Designed for speed and zero friction on the ground. No account registration needed to file an issue.
        </p>
      </div>

      {/* 4-Step Sequence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.step}
              className="p-5 rounded-lg border border-civic-200 bg-white/80 hover:bg-white hover:border-civic-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-civic-400">
                    {item.step}
                  </span>
                  <div className="w-8 h-8 rounded-md bg-civic-50 border border-civic-200 flex items-center justify-center text-civic-700">
                    <Icon size={16} weight="duotone" />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-civic-950 mb-2">
                  {item.title}
                </h3>
                
                <p className="text-xs text-civic-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-civic-100 flex items-center text-[11px] font-mono text-civic-400">
                <span>Phase {item.step} of 04</span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
