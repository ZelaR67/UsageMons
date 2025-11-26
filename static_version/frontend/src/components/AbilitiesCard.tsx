import React from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import { type Item } from '../types';
import { Tooltip } from './Tooltip';

interface AbilitiesCardProps {
  abilities: Item[];
}

export const AbilitiesCard: React.FC<AbilitiesCardProps> = ({ abilities }) => {
  const { abilities: abilityMeta } = useMetadata();

  if (!abilities || abilities.length === 0) return null;
  if (abilities.length === 1 && abilities[0].name.toLowerCase() === "no ability") return null;

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Abilities</h2>
      
      <div className="space-y-1">
        {abilities.map(ability => {
          const meta = abilityMeta[ability.id] || {};
          return (
            <Tooltip 
              key={ability.name} 
              content={meta.desc || "No description available."}
              className="block w-full"
            >
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100/50 dark:border-white/5 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 px-2 rounded transition-colors text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{ability.name}</span>
                <span className="font-bold text-gray-600 dark:text-gray-400">{ability.usage_percent}%</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
