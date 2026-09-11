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

const ICON_MAP: Record<string, React.ElementType> = {
  RoadHorizon,
  Lightbulb,
  Trash,
  Drop,
  Waves,
  DotsThreeCircle,
};

export const CategoryGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <section id="categories" className="py-14 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-civic-200">
      
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-civic-500 block mb-1">
            Dispatch Classification
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-civic-950">
            Issue Categories
          </h2>
        </div>
        <p className="text-xs text-civic-500 font-mono mt-2 sm:mt-0">
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
              className={`p-5 rounded-lg border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                isSelected 
                  ? 'border-civic-950 bg-white ring-1 ring-civic-950 shadow-sm' 
                  : 'border-civic-200 bg-white/70 hover:bg-white hover:border-civic-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-md bg-civic-100 flex items-center justify-center text-civic-800">
                    <IconComponent size={18} weight="duotone" />
                  </div>
                  <span className="text-[11px] font-mono text-civic-500">
                    {cat.count} active reports
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-civic-950 flex items-center gap-1.5">
                  <span>{cat.name}</span>
                  <ArrowUpRight size={13} className="text-civic-400 group-hover:text-civic-900" />
                </h3>

                <p className="text-xs text-civic-600 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-civic-100 flex items-center justify-between text-[11px]">
                <span className="font-mono text-civic-400">Ward Dept: Works</span>
                <span className="font-medium text-accent hover:underline">
                  {isSelected ? 'Selected' : 'Report this →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Report Simulation Prompt */}
      {selectedCategory && (
        <div className="mt-6 p-4 rounded-md bg-civic-100/90 border border-civic-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-civic-800">
            <CheckCircle size={16} weight="fill" className="text-accent" />
            <span>
              Category selected: <strong className="font-semibold">{CATEGORIES.find(c => c.id === selectedCategory)?.name}</strong>. Ready to attach photo and GPS coordinate.
            </span>
          </div>
          <button 
            onClick={() => alert(`Starting report flow for: ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`)}
            className="px-3.5 py-1.5 bg-civic-900 text-white rounded text-xs font-semibold hover:bg-black transition-colors"
          >
            Continue with Photo
          </button>
        </div>
      )}

    </section>
  );
};
