import { useEffect, useState, useMemo, memo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import * as ReactWindow from 'react-window';
const List = ReactWindow.FixedSizeList || (ReactWindow as any)['default']?.FixedSizeList || (ReactWindow as any)['List'] || (ReactWindow as any)['default']?.List || (ReactWindow as any)['default'];
import AutoSizer from 'react-virtualized-auto-sizer';
import { Dropdown } from './Dropdown';
import { PokemonSprite } from './PokemonSprite';
import { useRating } from '../contexts/RatingContext';
import { useQuery } from '@tanstack/react-query';
import { getFormats, getFormatRatings, getFormatData } from '../utils/api';
import { FORMAT_NAMES } from '../utils/formatNames';
import { useMobile } from '../contexts/MobileContext';

const RatingSelector = memo(({ ratings, currentRating, onRatingChange }: { 
  ratings: number[], 
  currentRating: number | null, 
  onRatingChange: (r: number) => void 
}) => {
  const selectedIndex = ratings.indexOf(currentRating || 0);
  const activeIndex = selectedIndex !== -1 ? selectedIndex : ratings.length - 1;

  return (
    <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-1">
      <div className="relative flex w-full isolate">
        <div
          className="absolute top-0 bottom-0 rounded-md bg-white dark:bg-gray-600 shadow-sm transition-transform duration-200 ease-out"
          style={{
            width: `${100 / ratings.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
            willChange: 'transform'
          }}
        />
        {ratings.map((r) => (
          <button
            key={r}
            onClick={() => onRatingChange(r)}
            className={`flex-1 relative z-10 py-1.5 text-xs font-medium text-center transition-colors duration-200 ${
              r === currentRating 
                ? 'text-gray-800 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
});

const Row = ({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
  const { items, originalList, navigate, formatId } = data;
  const p = items[index];
  const rank = originalList.indexOf(p) + 1;
  
  return (
    <div style={style} className="px-1">
       <button
         onClick={() => navigate(`/format/${formatId}/pokemon/${p.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, '')}`)}
         className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left group h-full"
       >
         <span className="font-mono text-gray-400 dark:text-gray-500 font-bold w-6 text-xs">#{rank}</span>
         <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <PokemonSprite name={p.name} className="max-w-full max-h-full group-hover:scale-110 transition-transform" />
         </div>
         <div className="flex-1 min-w-0">
           <div className="font-bold text-sm text-gray-700 dark:text-gray-200 truncate">{p.name}</div>
         </div>
         <div className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{p.usage_percent}%</div>
       </button>
    </div>
  );
};

export const Sidebar = () => {
  const { formatId, pokemonName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pokemonList, setPokemonList] = useState<{name: string, usage_percent: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { rating, setRating } = useRating();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    if (darkMode) {
      localStorage.theme = 'light';
      setDarkMode(false);
    } else {
      localStorage.theme = 'dark';
      setDarkMode(true);
    }
  };

  const { data: formats = [] } = useQuery<{id: string, name: string}[]>({
    queryKey: ['formats'],
    queryFn: () => getFormats()
  });

  const { data: availableRatings = [] } = useQuery<number[]>({
    queryKey: ['ratings', formatId],
    queryFn: () => getFormatRatings(formatId!),
    enabled: !!formatId
  });

  // Default to max rating when available ratings change
  useEffect(() => {
    if (availableRatings.length > 0) {
      const maxRating = Math.max(...availableRatings);
      if (rating === null || !availableRatings.includes(rating)) {
        setRating(maxRating);
      }
    }
  }, [availableRatings, rating, setRating]);

  const { data: pokemonData } = useQuery<{pokemon: {name: string, usage_percent: number}[], rating: number | null}>({
    queryKey: ['pokemonList', formatId, rating],
    queryFn: () => getFormatData(formatId!, rating!),
    enabled: !!formatId
  });

  useEffect(() => {
    if (pokemonData) {
      setPokemonList(pokemonData.pokemon);
    }
  }, [pokemonData]);

  useEffect(() => {
    const ratingParam = searchParams.get('rating');
    if (ratingParam && rating === null) {
      setRating(parseInt(ratingParam));
    }
  }, [searchParams, rating, setRating]);

  useEffect(() => {
    const ratingParam = searchParams.get('rating');
    if (ratingParam && rating === null) {
      setRating(parseInt(ratingParam));
    }
  }, [searchParams, rating, setRating]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const formatOptions = useMemo(() => formats.map(f => ({ 
    value: f.id, 
    label: FORMAT_NAMES[f.id] || f.name || f.id 
  })), [formats]);

  const pokemonOptions = useMemo(() => pokemonList.map(p => ({
    value: p.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, ''),
    label: p.name,
    customLabel: (
      <div className="flex justify-between items-center w-full">
        <span>{p.name}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{p.usage_percent}%</span>
      </div>
    )
  })), [pokemonList]);

  const filteredPokemonList = useMemo(() => {
    if (!searchTerm) return pokemonList;
    return pokemonList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [pokemonList, searchTerm]);

  const { isMobile } = useMobile();

  const desktopClasses = "w-96 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-800";
  const mobileClasses = "w-full h-full relative flex flex-col overflow-hidden";

  return (
    <aside className={`${isMobile ? mobileClasses : desktopClasses} bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-40`}>
      <div className={`flex flex-col gap-6 p-6 h-full ${!isMobile ? 'overflow-y-auto custom-scrollbar scrollbar-stable' : 'overflow-hidden'}`}>
        <div className="space-y-6 shrink-0">
        <div className="flex items-center justify-between">
          <Link to={formatId ? `/format/${formatId}` : '/'} className="hover:opacity-80 transition-opacity">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              UsageMons
            </h2>
          </Link>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-xl"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {isMobile ? (
          <div className="flex gap-3 items-end">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Format
                </label>
                {pokemonName && (
                  <Link 
                    to={`/format/${formatId}`}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider"
                  >
                    Back
                  </Link>
                )}
              </div>
              <Dropdown
                value={formatId || ''}
                onChange={(val) => {
                  setRating(null);
                  navigate(`/format/${val}`);
                }}
                options={formatOptions}
                placeholder="Format"
                searchable
              />
            </div>
            
            {rating !== null && availableRatings.length > 0 && (
              <div className="w-28 shrink-0">
                <div className="mb-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </label>
                </div>
                <Dropdown
                  value={rating.toString()}
                  onChange={(val) => handleRatingChange(parseInt(val))}
                  options={availableRatings.map(r => ({ value: r.toString(), label: r.toString() }))}
                  placeholder="Elo"
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Format
                </label>
                {pokemonName && (
                  <Link 
                    to={`/format/${formatId}`}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider"
                  >
                    Back
                  </Link>
                )}
              </div>
              <Dropdown
                value={formatId || ''}
                onChange={(val) => {
                  setRating(null);
                  navigate(`/format/${val}`);
                }}
                options={formatOptions}
                placeholder="Select Format"
                searchable
              />
            </div>

            {rating !== null && availableRatings.length > 0 && (
              <div className="px-1 -mt-2 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Glicko Threshold</span>
                </div>
                
                <RatingSelector 
                  ratings={availableRatings}
                  currentRating={rating}
                  onRatingChange={handleRatingChange}
                />
              </div>
            )}
          </>
        )}

        {formatId && (!isMobile || pokemonName) && (
          <Dropdown
            label="Pokemon"
            value={pokemonName || ''}
            onChange={(val) => navigate(`/format/${formatId}/pokemon/${val}`)}
            options={pokemonOptions}
            placeholder={pokemonName ? pokemonName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : "Select Pokemon"}
            searchable
          />
        )}
        </div>

        {isMobile && !pokemonName && formatId && pokemonList.length > 0 && (
          <>
            <div className="mt-2 px-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm py-2 z-10 shrink-0">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leaderboard</h3>
                 <span className="text-xs text-gray-400 dark:text-gray-500">{filteredPokemonList.length} Pokemon</span>
               </div>
               <input
                 type="text"
                 placeholder="Search Pokemon..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-black/40 outline-none text-sm transition-all"
               />
            </div>
            <div className="flex-1 min-h-0">
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    width={width}
                    itemCount={filteredPokemonList.length}
                    itemSize={60}
                    itemData={{
                      items: filteredPokemonList,
                      originalList: pokemonList,
                      navigate,
                      formatId
                    }}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
          </>
        )}

        <div id="sidebar-dex-info" className={`${pokemonName ? 'flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar' : 'hidden'}`}></div>
      </div>
    </aside>
  );
};
