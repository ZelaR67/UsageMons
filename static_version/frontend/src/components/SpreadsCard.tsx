import React from 'react';
import { type Spread } from '../types';
import { Tooltip } from './Tooltip';
import { calculateStats } from '../utils/stats';

interface SpreadsCardProps {
  spreads: Spread[];
  baseStats: number[];
}

export const SpreadsCard: React.FC<SpreadsCardProps> = ({ spreads, baseStats }) => {
  if (!spreads || spreads.length === 0) return null;

  const parseSpread = (spreadStr: string) => {
    try {
      const [nature, evsStr] = spreadStr.split(':');
      const evs = evsStr.split('/').map(Number);
      return { nature, evs };
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">EV Spreads</h2>
      <div className="space-y-1">
        {spreads.map((spread, idx) => {
          const parsed = parseSpread(spread.spread);
          let tooltipContent = "Cannot calculate stats";
          
          if (parsed && baseStats) {
            const stats = calculateStats(baseStats, parsed.evs, parsed.nature);
            tooltipContent = (
              <div className="text-xs">
                <div className="font-bold mb-1 text-center border-b border-white/20 pb-1">{parsed.nature} Nature</div>
                <div className="grid grid-cols-[20px_1fr] gap-x-2 gap-y-0.5">
                  <span className="font-bold text-red-300">HP</span> <span className="text-right">{stats[0]}</span>
                  <span className="font-bold text-orange-300">Atk</span> <span className="text-right">{stats[1]}</span>
                  <span className="font-bold text-yellow-300">Def</span> <span className="text-right">{stats[2]}</span>
                  <span className="font-bold text-blue-300">SpA</span> <span className="text-right">{stats[3]}</span>
                  <span className="font-bold text-green-300">SpD</span> <span className="text-right">{stats[4]}</span>
                  <span className="font-bold text-pink-300">Spe</span> <span className="text-right">{stats[5]}</span>
                </div>
              </div>
            ) as unknown as string;
          }

          return (
            <Tooltip key={idx} content={tooltipContent} className="block w-full">
              <div className="flex justify-between text-sm hover:bg-white/20 dark:hover:bg-white/5 p-2 rounded transition-colors cursor-help">
                <span className="font-mono text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-white/10 px-2 py-0.5 rounded text-xs">{spread.spread}</span>
                <span className="font-bold text-gray-600 dark:text-gray-400">{spread.usage_percent}%</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

