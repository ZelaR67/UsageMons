import { useEffect, useState, useMemo, memo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Dropdown } from './Dropdown';
import { useRating } from '../contexts/RatingContext';
import { useQuery } from '@tanstack/react-query';
import { getFormats, getFormatRatings, getFormatData } from '../utils/api';

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

export const Sidebar = () => {
  const { formatId, pokemonName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pokemonList, setPokemonList] = useState<{name: string, usage_percent: number}[]>([]);
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

  const { data: pokemonData } = useQuery<{pokemon: {name: string, usage_percent: number}[], rating: number | null}>({
    queryKey: ['pokemonList', formatId, rating],
    queryFn: () => getFormatData(formatId!, rating!),
    enabled: !!formatId
  });

  useEffect(() => {
    if (pokemonData) {
      setPokemonList(pokemonData.pokemon);
      if (rating === null) {
         setRating(pokemonData.rating);
      }
    }
  }, [pokemonData, rating, setRating]);

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

  const formatOptions = useMemo(() => formats.map(f => ({ value: f.id, label: f.name })), [formats]);

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

  return (
    <aside className="w-96 h-screen fixed left-0 top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-6 flex flex-col gap-6 z-40 custom-scrollbar scrollbar-stable">
      <div className="space-y-6">
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

        {formatId && (
          <Dropdown
            label="Pokemon"
            value={pokemonName || ''}
            onChange={(val) => navigate(`/format/${formatId}/pokemon/${val}`)}
            options={pokemonOptions}
            placeholder="Select Pokemon"
            searchable
          />
        )}
      </div>

      <div id="sidebar-dex-info" className="flex-1 flex flex-col gap-4"></div>
    </aside>
  );
};
