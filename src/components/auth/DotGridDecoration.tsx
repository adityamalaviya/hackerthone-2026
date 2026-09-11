import React from 'react';

interface DotGridDecorationProps {
  rows?: number;
  cols?: number;
  className?: string;
}

/**
 * Restrained, craft-inspired dot-grid decoration for the top-right corner of cards.
 * Inspired by Emil Kowalski taste-first polish: subtle, elegant, low visual noise.
 */
export const DotGridDecoration: React.FC<DotGridDecorationProps> = ({
  rows = 4,
  cols = 5,
  className = '',
}): React.JSX.Element => {
  return (
    <div
      aria-hidden="true"
      className={`absolute top-5 right-5 sm:top-6 sm:right-6 pointer-events-none select-none opacity-40 hover:opacity-60 transition-opacity ${className}`}
    >
      <div
        className="grid gap-1.5"
        /* DOCUMENTED INLINE STYLE EXCEPTION: Dynamic CSS Grid column count based on runtime cols prop */
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: rows * cols }).map((_: unknown, i: number): React.JSX.Element => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-civic-400 dark:bg-civic-600 block"
          />
        ))}
      </div>
    </div>
  );
};
