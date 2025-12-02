import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Counter } from '../types';
import { Tooltip } from './Tooltip';
import { PokemonSprite } from './PokemonSprite';
import { useMobile } from '../contexts/MobileContext';

interface MatchupsCardProps {
  dominates: Counter[]; // Things I beat (Green)
  counters: Counter[];  // Things that beat me (Red)
  formatId: string;
}

export const MatchupsCard: React.FC<MatchupsCardProps> = ({ dominates, counters, formatId }) => {
  const [activeTab, setActiveTab] = useState<'dominates' | 'counters'>('dominates');
  const [showRelevantOnly, setShowRelevantOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'usage' | 'score'>('score');
  const { isMobile } = useMobile();
  
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const beatsRef = useRef<HTMLButtonElement>(null);
  const checkedByRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const activeRef = activeTab === 'dominates' ? beatsRef : checkedByRef;
    if (activeRef.current) {
      setUnderlineStyle({
        left: activeRef.current.offsetLeft,
        width: activeRef.current.offsetWidth
      });
    }
  }, [activeTab]);

  const rawData = activeTab === 'dominates' ? dominates : counters;
  
  const filteredData = showRelevantOnly
    ? rawData?.filter(mon => (mon.usage_percent || 0) > 0.5) 
    : rawData ? [...rawData] : [];

  const data = filteredData?.sort((a, b) => {
    if (sortBy === 'usage') {
      return (b.usage_percent || 0) - (a.usage_percent || 0);
    }
    return b.score - a.score;
  });

  const colorClass = activeTab === 'dominates' 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-500 dark:text-red-400';
  
  const hoverClass = activeTab === 'dominates'
    ? 'group-hover:text-green-800 dark:group-hover:text-green-300'
    : 'group-hover:text-red-700 dark:group-hover:text-red-300';

  return (
    <div className={`glass-card p-4 ${isMobile ? 'h-full flex flex-col' : 'h-fit'}`}>
      <div className="flex justify-between items-center mb-4 border-b border-gray-200/50 dark:border-white/10">
        <div className="flex space-x-6 relative">
          <button
            ref={beatsRef}
            onClick={() => setActiveTab('dominates')}
            className={`pb-2 text-sm font-bold transition-colors duration-200 ${
              activeTab === 'dominates' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Beats
          </button>
          <button
            ref={checkedByRef}
            onClick={() => setActiveTab('counters')}
            className={`pb-2 text-sm font-bold transition-colors duration-200 ${
              activeTab === 'counters' 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Checked By
          </button>
          <div 
            className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out rounded-full ${
              activeTab === 'dominates' ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'
            }`}
            style={{ 
              left: underlineStyle.left, 
              width: underlineStyle.width
            }}
          />
        </div>
        <div className="flex items-center pb-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end justify-between h-12 text-[10px] font-bold uppercase tracking-wider select-none py-1">
              <span 
                className={`cursor-pointer transition-colors ${showRelevantOnly ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-700'}`} 
                onClick={() => setShowRelevantOnly(true)}
              >
                Relevant
              </span>
              <span 
                className={`cursor-pointer transition-colors ${!showRelevantOnly ? 'text-gray-600 dark:text-gray-300' : 'text-gray-300 dark:text-gray-700'}`} 
                onClick={() => setShowRelevantOnly(false)}
              >
                All
              </span>
            </div>
            <div 
              className="relative w-4 h-12 flex justify-center cursor-pointer group"
              onClick={() => setShowRelevantOnly(!showRelevantOnly)}
              title="Toggle Relevance Filter"
            >
              {/* Track */}
              <div className="absolute top-1 bottom-1 w-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
              
              {/* Knob */}
              <div 
                className={`absolute left-1/2 -translate-x-1/2 top-1 w-3 h-3 rounded-full shadow-sm transition-all duration-300 border-2 border-white dark:border-gray-800 ${
                  showRelevantOnly 
                    ? 'bg-blue-600 dark:bg-blue-400 shadow-blue-500/50 translate-y-0' 
                    : 'bg-gray-400 dark:bg-gray-500 translate-y-[28px]'
                }`} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`space-y-1 ${isMobile ? 'flex-1 overflow-y-auto custom-scrollbar' : ''}`}>
        <div className="flex justify-between text-gray-500 dark:text-gray-400 border-b border-gray-200/30 dark:border-white/5 pb-2 px-2 text-sm font-medium">
          <span>Pokemon</span>
          <div className="flex gap-4">
            <button 
              onClick={() => setSortBy('usage')}
              className={`w-12 text-right transition-colors ${sortBy === 'usage' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Usage
            </button>
            <button 
              onClick={() => setSortBy('score')}
              className={`w-12 text-right transition-colors ${sortBy === 'score' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Score
            </button>
          </div>
        </div>
        
        {data && data.length > 0 ? (
          data.slice(0, isMobile ? 50 : 20).map((mon) => {
            const wins = mon.count ? Math.round(mon.count * (mon.score / 100)) : 0;
            const total = mon.count ? Math.round(mon.count) : 0;
            
            const tooltipContent = (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center min-w-[60px]">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full mb-1">
                    <PokemonSprite name={mon.name} className="max-w-full max-h-full scale-125 pixelated object-contain" />
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {mon.usage_percent}%
                  </span>
                </div>
                <div className="w-px h-10 bg-gray-400/50 dark:bg-gray-500/50"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm truncate max-w-[120px]">{mon.name}</span>
                  <span className="text-xs text-gray-300">
                    {activeTab === 'dominates' ? 'Wins' : 'Losses'}: {wins} / {total}
                  </span>
                  <span className="text-xs text-gray-400">
                    Winrate: {mon.score}%
                  </span>
                </div>
              </div>
            );

            return (
              <Tooltip 
                key={mon.name} 
                content={tooltipContent}
                className="block w-full"
              >
                <div className="flex justify-between items-center py-2 px-2 hover:bg-white/20 dark:hover:bg-white/5 transition-colors rounded group">
                  <Link 
                    to={`/format/${formatId}/pokemon/${mon.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, '')}`}
                    className={`font-medium transition-colors block text-sm ${colorClass} ${hoverClass}`}
                  >
                    {mon.name}
                  </Link>
                  <div className="flex gap-4 text-sm">
                    <span className={`w-12 text-right ${sortBy === 'usage' ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-500'}`}>
                      {mon.usage_percent}%
                    </span>
                    <span className={`w-12 text-right font-mono ${sortBy === 'score' ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                      {mon.score}
                    </span>
                  </div>
                </div>
              </Tooltip>
            );
          })
        ) : (
          <div className="py-8 text-center text-gray-400 dark:text-gray-500 italic text-xs">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};
