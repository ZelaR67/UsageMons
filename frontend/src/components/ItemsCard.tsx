import React from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import type { Item } from '../types';
import { Tooltip } from './Tooltip';
import { useMobile } from '../contexts/MobileContext';

interface ItemsCardProps {
  items: Item[];
  className?: string;
}

export const ItemsCard: React.FC<ItemsCardProps> = ({ items, className }) => {
  const { items: itemMeta } = useMetadata();
  const { isMobile } = useMobile();

  if (!items || items.length === 0) return null;
  if (items.length === 1 && items[0].name.toLowerCase() === "nothing") return null;

  return (
    <div className={`glass-card p-4 ${className || ''} ${isMobile ? 'flex flex-col' : ''}`}>
      <h2 className="text-lg font-bold mb-3 border-b border-gray-200/50 dark:border-white/10 pb-2 text-gray-800 dark:text-gray-100">Items</h2>
      <div className={`space-y-1 ${isMobile ? 'flex-1 overflow-y-auto custom-scrollbar' : ''}`}>
        {items
          .filter(item => item.name && item.name.trim() !== "")
          .slice(0, isMobile ? 20 : 6).map(item => {
          const meta = itemMeta[item.id] || {};
          
          // Sprite sheet logic
          const spritenum = meta.spritenum || 0;
          const col = spritenum % 16;
          const row = Math.floor(spritenum / 16);
          const baseUrl = import.meta.env.BASE_URL;
          
          const spriteStyle: React.CSSProperties = {
            backgroundImage: `url(${baseUrl}assets/itemicons-sheet.png)`,
            backgroundPosition: `${col * -24}px ${row * -24}px`,
            width: '24px',
            height: '24px',
            backgroundRepeat: 'no-repeat',
            display: 'inline-block'
          };

          const tooltipContent = (
            <div className="flex flex-col gap-2">
              <div className="font-bold border-b border-gray-400/30 pb-1 mb-1">{item.name}</div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <div style={spriteStyle} title={item.name} />
                </div>
                <div className="w-px h-8 bg-gray-400/50 dark:bg-gray-500/50"></div>
                <span className="flex-1">{meta.desc || meta.shortDesc || "No description available."}</span>
              </div>
            </div>
          );

          return (
            <Tooltip 
              key={item.name} 
              content={tooltipContent}
              className="block w-full"
            >
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100/50 dark:border-white/5 last:border-0 hover:bg-white/20 dark:hover:bg-white/5 px-2 rounded transition-colors text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <div style={{...spriteStyle, transform: 'scale(0.8)'}} title={item.name} className="flex-shrink-0" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">{item.usage_percent}%</span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
