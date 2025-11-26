import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useRating } from '../contexts/RatingContext';
import { PokemonSprite } from '../components/PokemonSprite';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '../utils/api';

interface PokemonEntry {
  name: string;
  rank: number;
  usage_percent: number;
}

interface FormatData {
  format: string;
  rating: number;
  pokemon: PokemonEntry[];
}

export default function Format() {
  const { formatId } = useParams();
  const [searchParams] = useSearchParams();
  const { rating } = useRating();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm("");
  }, [formatId]);

  const ratingParam = rating !== null ? rating : searchParams.get('rating');

  const { data, isLoading: loading } = useQuery<FormatData>({
    queryKey: ['format', formatId, ratingParam],
    queryFn: () => fetch(getApiUrl(`api/format/${formatId}`, { rating: ratingParam })).then(res => {
        if (!res.ok) throw new Error("Format not found");
        return res.json();
    }),
    enabled: !!formatId
  });

  if (loading) return <div className="p-8 text-center text-white text-xl font-light animate-pulse">Loading stats...</div>;
  if (!data) return <div className="p-8 text-center text-white text-xl">Format not found.</div>;

  const filteredPokemon = data.pokemon.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-4 max-w-4xl mx-auto transition-opacity duration-200`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold capitalize text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 drop-shadow-sm">{data.format} Stats</h1>
        <span className="text-gray-600 dark:text-gray-300 font-medium bg-white/40 dark:bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/50 dark:border-white/20">Glicko: {data.rating}</span>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Pokémon..."
          className="w-full glass-input text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="glass-panel overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/40 dark:border-white/10 bg-white/20 dark:bg-white/5 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Pokémon</div>
          <div className="col-span-4 text-right">Usage %</div>
        </div>
        <ul className="divide-y divide-white/30 dark:divide-white/10">
          {filteredPokemon.map(mon => (
            <li key={mon.name} className="hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
              <Link 
                to={`/format/${formatId}/pokemon/${mon.name.toLowerCase().replace(/ /g, '-').replace(/['.:]/g, '')}`}
                className="grid grid-cols-12 gap-4 p-4 items-center"
              >
                <span className="col-span-2 text-center font-mono text-gray-500 dark:text-gray-400 font-bold">#{mon.rank}</span>
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <PokemonSprite
                      name={mon.name}
                      className="max-w-full max-h-full scale-125"
                    />
                  </div>
                  <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{mon.name}</span>
                </div>
                <span className="col-span-4 text-right font-mono font-medium text-blue-600 dark:text-blue-400">{mon.usage_percent}%</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
