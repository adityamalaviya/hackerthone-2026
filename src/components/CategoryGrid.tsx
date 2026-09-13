import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockIssues';
import { 
  RoadHorizon, 
  Lightbulb, 
  Trash, 
  Drop, 
  Waves, 
  DotsThreeCircle,
  ArrowUpRight,
  CheckCircle
} from '@phosphor-icons/react';

import { CivicCategory } from '../types/admin';

const ICON_MAP: Record<string, React.ElementType> = {
  RoadHorizon,
  Lightbulb,
  Trash,
  Drop,
  Waves,
  DotsThreeCircle,
};

const CATEGORY_MAP: Record<string, CivicCategory> = {
  pothole: 'Pothole',
  streetlight: 'Streetlight',
  garbage: 'Garbage',
  water: 'Water Leakage',
  drainage: 'Drainage',
  other: 'Other',
};

interface CategoryGridProps {
  onReportCategory?: (category: CivicCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onReportCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <section id="categories" className="py-14 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-civic-200 dark:border-civic-800">
      
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10">
        <div>
          <span className="text-2xs font-mono uppercase tracking-wider text-civic-500 dark:text-civic-400 block mb-1">
            Dispatch Classification
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-civic-950 dark:text-civic-50">
            Issue Categories
          </h2>
        </div>
        <p className="text-xs text-civic-500 dark:text-civic-400 font-mono mt-2 sm:mt-0">
          Direct ward team routing
        </p>
      </div>

      {/* Grid of 6 categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || DotsThreeCircle;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-xs ${
                isSelected 
                  ? 'border-accent dark:border-accent bg-white dark:bg-civic-900 ring-1 ring-accent shadow-sm' 
                  : 'border-civic-200 dark:border-civic-800 bg-white/80 dark:bg-civic-900/80 hover:bg-white dark:hover:bg-civic-900 hover:border-civic-300 dark:hover:border-civic-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-civic-100 dark:bg-civic-800 flex items-center justify-center text-civic-800 dark:text-civic-200">
                    <IconComponent size={18} weight="duotone" />
                  </div>
                  <span className="text-2xs font-mono text-civic-500 dark:text-civic-400">
                    {cat.count} active reports
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-civic-950 dark:text-civic-100 flex items-center gap-1.5">
                  <span>{cat.name}</span>
                  <ArrowUpRight size={13} className="text-civic-400 group-hover:text-civic-900 dark:group-hover:text-civic-100" />
                </h3>

                <p className="text-xs text-civic-600 dark:text-civic-400 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-civic-100 dark:border-civic-800 flex items-center justify-between text-2xs">
                <span className="font-mono text-civic-400 dark:text-civic-500">Ward Dept: Works</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const mapped = CATEGORY_MAP[cat.id] || 'Other';
                    onReportCategory?.(mapped);
                  }}
                  className="font-medium text-accent hover:underline cursor-pointer"
                >
                  Report this →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Report Simulation Prompt */}
      {selectedCategory && (
        <div className="mt-6 p-4 rounded-xl bg-civic-100/90 dark:bg-civic-900 border border-civic-300/80 dark:border-civic-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-civic-800 dark:text-civic-200">
            <CheckCircle size={16} weight="fill" className="text-accent" />
            <span>
              Category selected: <strong className="font-semibold">{CATEGORIES.find(c => c.id === selectedCategory)?.name}</strong>. Ready to attach photo and GPS coordinate.
            </span>
          </div>
          <button 
            type="button"
            onClick={() => {
              const mapped = CATEGORY_MAP[selectedCategory] || 'Other';
              onReportCategory?.(mapped);
            }}
            className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            File Grievance with Photo
          </button>
        </div>
      )}

    </section>
  );
};
