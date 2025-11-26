import React from 'react';
import { Link } from 'react-router-dom';
import type { Teammate } from '../types';

interface TeammatesCardProps {
  teammates: Teammate[];
  formatId: string;
}

export const TeammatesCard: React.FC<TeammatesCardProps> = ({ teammates, formatId }) => {
  if (!teammates || teammates.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Teammates</h2>
      <ul className="space-y-1">
        {teammates.slice(0, 10).map(mate => (
          <li key={mate.name}>
            <Link 
              to={`/format/${formatId}/pokemon/${mate.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, '')}`}
              className="flex justify-between items-center hover:bg-white/20 dark:hover:bg-white/5 p-2 rounded transition-colors text-sm w-full group"
            >
              <span className="text-blue-600 group-hover:text-blue-800 dark:text-blue-400 dark:group-hover:text-blue-300 font-medium transition-colors">
                {mate.name}
              </span>
              <span className="font-bold text-gray-600 dark:text-gray-400">{mate.usage_percent}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
