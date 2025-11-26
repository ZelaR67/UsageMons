import React from 'react';
import { type TeraType } from '../types';
import { getTypeColor } from '../utils/colors';

interface TeraTypesCardProps {
  teraTypes: TeraType[];
}

export const TeraTypesCard: React.FC<TeraTypesCardProps> = ({ teraTypes }) => {
  if (!teraTypes || teraTypes.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Tera Types</h2>
      <div className="space-y-1">
        {teraTypes.slice(0, 8).map((tera) => (
          <div key={tera.tera_type} className="flex justify-between items-center hover:bg-white/20 dark:hover:bg-white/5 p-2 rounded transition-colors text-sm">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: getTypeColor(tera.tera_type) }}
              ></span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{tera.tera_type}</span>
            </div>
            <span className="font-bold text-gray-600 dark:text-gray-400">{tera.usage_percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
