import React from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import { getTypeColor } from '../utils/colors';
import { Tooltip } from './Tooltip';

type BuildType = 'items' | 'abilities' | 'tera';

interface MobileBuildCardProps {
  type: BuildType;
  data: any[];
}

export const MobileBuildCard: React.FC<MobileBuildCardProps> = React.memo(({ type, data }) => {
  const { items: itemMeta, abilities: abilityMeta } = useMetadata();

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(item => {
      if (!item) return false;
      const name = (item.name || item.tera_type || '').toLowerCase();
      return name !== 'nothing' && name !== 'no ability' && name !== '';
    });
  }, [data]);

  const sortedData = React.useMemo(() => {
    const getUsage = (item: any) => item.usage_percent || 0;
    return [...filteredData].sort((a, b) => getUsage(b) - getUsage(a));
  }, [filteredData]);

  if (filteredData.length === 0) return null;

  // Helper to render icon
  const renderIcon = (item: any) => {
    if (type === 'items') {
       const meta = itemMeta[item.id] || {};
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
       return <div style={spriteStyle} />;
    }
    if (type === 'tera') {
        return (
            <span 
                className="w-4 h-4 rounded-full shadow-sm block"
                style={{ backgroundColor: getTypeColor(item.tera_type) }}
            ></span>
        );
    }
    return null;
  };

  const getUsage = (item: any) => {
      return item.usage_percent || 0;
  };

  const getName = (item: any) => {
      if (type === 'tera') return item.tera_type;
      return item.name;
  };

  const getTooltipContent = (item: any) => {
      if (type === 'items') {
          const meta = itemMeta[item.id] || {};
          return (
            <div className="flex flex-col gap-2">
              <div className="font-bold border-b border-gray-400/30 pb-1 mb-1">{item.name}</div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  {renderIcon(item)}
                </div>
                <div className="w-px h-8 bg-gray-400/50 dark:bg-gray-500/50"></div>
                <span className="flex-1">{meta.desc || meta.shortDesc || "No description available."}</span>
              </div>
            </div>
          );
      }
      if (type === 'abilities') {
          const meta = abilityMeta[item.id] || {};
          return (
            <div className="flex flex-col gap-1">
              <div className="font-bold border-b border-gray-400/30 pb-1 mb-1">{item.name}</div>
              <span>{meta.desc || meta.shortDesc || "No description available."}</span>
            </div>
          );
      }
      return null;
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {sortedData.slice(0, 100).map((item, idx) => {
              const tooltipContent = getTooltipContent(item);
              const content = (
                <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                        {type !== 'abilities' && (
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                {renderIcon(item)}
                            </div>
                        )}
                        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm truncate">
                            {getName(item)}
                        </span>
                    </div>
                    <span className="font-bold text-gray-600 dark:text-gray-400 text-sm flex-shrink-0">
                        {getUsage(item).toFixed(1)}%
                    </span>
                </div>
              );

              if (tooltipContent) {
                  return (
                      <Tooltip key={idx} content={tooltipContent} className="block w-full">
                          {content}
                      </Tooltip>
                  );
              }
              return <div key={idx}>{content}</div>;
          })}
       </div>
    </div>
  );
});
