import React from 'react';
import type { TeraType } from '../types';
import { getTypeColor } from '../utils/colors';
import { useMobile } from '../contexts/MobileContext';

interface TeraTypesCardProps {
  teraTypes: TeraType[];
  className?: string;
}

export const TeraTypesCard: React.FC<TeraTypesCardProps> = ({ teraTypes, className }) => {
  const { isMobile } = useMobile();
  if (!teraTypes || teraTypes.length === 0) return null;

  return (
    <div className={`glass-card p-4 ${className || ''} ${isMobile ? 'flex flex-col' : ''}`}>
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Tera Types</h2>
      <div className={`space-y-1 ${isMobile ? 'flex-1 overflow-y-auto custom-scrollbar' : ''}`}>
        {teraTypes.slice(0, isMobile ? 18 : 8).map((tera) => (
          <div key={tera.tera_type} className="flex justify-between items-center hover:bg-white/20 dark:hover:bg-white/5 p-2 rounded transition-colors text-sm">
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
              <span 
                className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                style={{ backgroundColor: getTypeColor(tera.tera_type) }}
              ></span>
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{tera.tera_type}</span>
            </div>
            <span className="font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">{tera.usage_percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
