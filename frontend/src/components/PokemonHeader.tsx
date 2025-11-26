import React from 'react';
import { getTypeColor } from '../utils/colors';
import { useMetadata } from '../contexts/MetadataContext';
import { Tooltip } from './Tooltip';
import { PokemonSprite } from './PokemonSprite';

interface PokemonHeaderProps {
  name: string;
  rank: number;
  usage_percent: number;
  types: string[];
  possible_abilities: string[];
  base_stats: number[];
  rating?: number;
}

export const PokemonHeader: React.FC<PokemonHeaderProps> = ({
  name,
  rank,
  usage_percent,
  types,
  possible_abilities,
  base_stats,
  rating,
}) => {
  const { abilities: abilityMeta } = useMetadata();

  const toId = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-24 h-24 flex items-center justify-center bg-white/40 rounded-full border border-white/60 shadow-inner backdrop-blur-sm">
          <PokemonSprite 
            name={name} 
            className="max-w-full max-h-full scale-125 drop-shadow-md" 
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold flex flex-col items-center gap-0.5 text-gray-800 dark:text-gray-100 drop-shadow-sm">
            {name}
            <span className="text-base font-normal text-gray-500 dark:text-gray-400">#{rank}</span>
          </h1>
          <div className="flex gap-1.5 mt-1.5 mb-2 justify-center">
            {types.map(type => (
              <span key={type} className={`px-2.5 py-0.5 rounded-lg text-white text-xs font-bold shadow-sm`} style={{ backgroundColor: getTypeColor(type) }}>
                {type}
              </span>
            ))}
          </div>

          {possible_abilities && possible_abilities.length > 0 && (
            <div className="flex flex-col gap-0.5 items-center text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] tracking-wider">Abilities</span>
              <div className="flex flex-wrap justify-center gap-1">
                {possible_abilities.map(ability => {
                  const id = toId(ability);
                  const meta = abilityMeta[id] || {};
                  return (
                    <Tooltip 
                      key={ability} 
                      content={meta.desc || "No description available."}
                    >
                      <span className="text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded border border-white/60 dark:border-white/20 shadow-sm cursor-help text-xs">
                        {ability}
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center bg-white/30 dark:bg-black/20 p-2 rounded-xl border border-white/40 dark:border-white/10">
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 drop-shadow-sm">{usage_percent}%</div>
        <div className="text-gray-600 dark:text-gray-400 font-medium text-[10px] uppercase tracking-wider">Usage Rate</div>
        {(rating !== undefined && rating !== null) && (
           <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Glicko Threshold: {rating}</div>
        )}
      </div>

      <div className="w-full bg-white/30 dark:bg-black/20 p-4 rounded-xl border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-md">
        <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-3 tracking-wider border-b border-gray-200/50 dark:border-white/10 pb-1.5">Base Stats</h3>
        <div className="space-y-2">
          {['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'].map((label, i) => {
            const value = base_stats[i];
            const hue = Math.max(0, Math.min((value - 40) * 1.5, 150));
            const barColor = `hsl(${hue}, 85%, 45%)`;
            
            return (
              <div key={label} className="grid grid-cols-[60px_30px_1fr] items-center gap-2">
                <span className="text-right font-bold text-gray-600 dark:text-gray-400 text-xs">{label}:</span>
                <span className="font-bold text-right text-gray-800 dark:text-gray-100 text-sm">{value}</span>
                <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded shadow-sm transition-all duration-500 ease-out"
                    style={{ 
                        width: `${Math.min((value / 255) * 100, 100)}%`,
                        backgroundColor: barColor,
                        backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(0,0,0,0.1))'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium border-t border-gray-200/50 dark:border-white/10 pt-2">
          <span>Total</span>
          <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">{base_stats.reduce((a, b) => a + b, 0)}</span>
        </div>
      </div>
    </div>
  );
};
