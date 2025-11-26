import React from 'react';
import { Link } from 'react-router-dom';
import type { Counter } from '../types';

interface DominatesCardProps {
  dominates: Counter[];
  formatId: string;
}

export const DominatesCard: React.FC<DominatesCardProps> = ({ dominates, formatId }) => {
  if (!dominates || dominates.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Counters / Checks</h2>
      <ul className="space-y-1">
        {dominates.slice(0, 10).map(mon => (
          <li key={mon.name}>
            <Link 
              to={`/format/${formatId}/pokemon/${mon.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, '')}`}
              className="flex justify-between items-center hover:bg-white/20 dark:hover:bg-white/5 p-2 rounded transition-colors text-sm w-full group"
            >
              <span className="text-green-600 group-hover:text-green-800 dark:text-green-400 dark:group-hover:text-green-300 font-medium transition-colors">
                {mon.name}
              </span>
              <span className="font-bold text-gray-600 dark:text-gray-400">{mon.score}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
