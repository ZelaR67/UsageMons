import React from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import type { Item } from '../types';
import { Tooltip } from './Tooltip';

interface ItemsCardProps {
  items: Item[];
}

export const ItemsCard: React.FC<ItemsCardProps> = ({ items }) => {
  const { items: itemMeta } = useMetadata();

  if (!items || items.length === 0) return null;
  if (items.length === 1 && items[0].name.toLowerCase() === "nothing") return null;

  return (
    <div className="glass-card p-4">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Items</h2>
      <div className="space-y-1">
        {items
          .filter(item => item.name && item.name.trim() !== "")
          .slice(0, 6).map(item => {
          const meta = itemMeta[item.id] || {};
          return (
            <Tooltip 
              key={item.name} 
              content={meta.desc || meta.shortDesc || "No description available."}
              className="block w-full"
            >
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100/50 dark:border-white/5 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 px-2 rounded transition-colors text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                <span className="font-bold text-gray-600 dark:text-gray-400">{item.usage_percent}%</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
