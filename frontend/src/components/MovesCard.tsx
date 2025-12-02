import React from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import type { Move } from '../types';
import { getTypeColor } from '../utils/colors';
import { Tooltip } from './Tooltip';
import { useMobile } from '../contexts/MobileContext';

interface MovesCardProps {
  moves: Move[];
}

export const MovesCard: React.FC<MovesCardProps> = ({ moves }) => {
  const { moves: moveMeta } = useMetadata();
  const { isMobile } = useMobile();

  if (!moves || moves.length === 0) return null;

  return (
    <div className={`glass-card p-4 ${isMobile ? 'h-full flex flex-col' : ''}`}>
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Top Moves</h2>
      <div className={`${isMobile ? 'flex-1 overflow-y-auto custom-scrollbar' : 'overflow-y-auto max-h-72 pr-2 custom-scrollbar'} space-y-0.5`}>
        {moves.slice(0, isMobile ? 50 : 25).map((move, i) => {
          const meta = moveMeta[move.id] || {};
          const displayName = move.name || "No Move";
          const tooltipContent = (
            <div className="flex flex-col gap-1">
              <div className="font-bold border-b border-gray-400/30 pb-1 mb-1">{displayName}</div>
              <span>{meta.desc || meta.shortDesc || "No description available."}</span>
            </div>
          );
          return (
            <Tooltip 
              key={move.name || i} 
              content={tooltipContent}
              className="block w-full"
            >
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100/50 dark:border-white/5 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 px-2 rounded transition-colors text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <span className={`font-medium truncate ${!move.name ? 'text-gray-400 italic' : 'text-gray-700 dark:text-gray-300'}`}>{displayName}</span>
                  {meta.type && (
                    <span 
                      className="text-[10px] text-white px-1.5 py-0.5 rounded shadow-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: getTypeColor(meta.type) }}
                    >
                      {meta.type}
                    </span>
                  )}
                </div>
                <span className="font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">{move.usage_percent}%</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
