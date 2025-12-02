import React from 'react';
import { Link } from 'react-router-dom';
import type { Teammate } from '../types';
import { Tooltip } from './Tooltip';
import { PokemonSprite } from './PokemonSprite';
import { useMobile } from '../contexts/MobileContext';

interface TeammatesCardProps {
  teammates: Teammate[];
  formatId: string;
  globalUsageMap?: Record<string, number>;
}

export const TeammatesCard: React.FC<TeammatesCardProps> = ({ teammates, formatId, globalUsageMap }) => {
  const { isMobile } = useMobile();
  if (!teammates || teammates.length === 0) return null;

  return (
    <div className={`glass-card p-4 ${isMobile ? 'h-full flex flex-col' : ''}`}>
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Teammates</h2>
      <ul className={`space-y-1 ${isMobile ? 'flex-1 overflow-y-auto custom-scrollbar' : ''}`}>
        {teammates.slice(0, isMobile ? 50 : 10).map(mate => {
          const usage = globalUsageMap ? (globalUsageMap[mate.name] || 0) : 0;
          const teammateUsage = mate.usage_percent;
          return (
            <li key={mate.name}>
              <Tooltip 
                className="block w-full"
                content={
                  <div className="flex flex-col items-center p-2 min-w-[120px]">
                    <PokemonSprite name={mate.name} className="w-16 h-16 pixelated object-contain" />
                    <span className="font-bold text-sm mt-1">{mate.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Global Usage: {usage}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Teammate Usage: {teammateUsage}%</span>
                  </div>
                }
              >
                <Link 
                  to={`/format/${formatId}/pokemon/${mate.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, '')}`}
                  className="flex justify-between items-center hover:bg-white/20 dark:hover:bg-white/5 p-2 rounded transition-colors text-sm w-full group"
                >
                  <span className="text-blue-600 group-hover:text-blue-800 dark:text-blue-400 dark:group-hover:text-blue-300 font-medium transition-colors truncate mr-2">
                    {mate.name}
                  </span>
                  <span className="font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">{teammateUsage}%</span>
                </Link>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
