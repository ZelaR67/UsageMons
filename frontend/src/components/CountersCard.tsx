import React from 'react';
import { Link } from 'react-router-dom';
import { Counter } from '../types';

interface CountersCardProps {
  counters: Counter[];
  formatId: string;
}

export const CountersCard: React.FC<CountersCardProps> = ({ counters, formatId }) => {
  if (!counters || counters.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Checked/Countered By</h2>
      <ul className="space-y-1">
        {counters.slice(0, 10).map(counter => (
          <li key={counter.name}>
            <Link 
              to={`/format/${formatId}/pokemon/${counter.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, '')}`}
              className="flex justify-between items-center hover:bg-white/20 dark:hover:bg-white/5 p-2 rounded transition-colors text-sm w-full group"
            >
              <span className="text-red-500 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300 font-medium transition-colors">
                {counter.name}
              </span>
              <span className="font-bold text-gray-600 dark:text-gray-400">{counter.score}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
