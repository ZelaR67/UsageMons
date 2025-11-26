import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { PokemonHeader } from '../components/PokemonHeader';
import { MovesCard } from '../components/MovesCard';
import { ItemsCard } from '../components/ItemsCard';
import { AbilitiesCard } from '../components/AbilitiesCard';
import { TeammatesCard } from '../components/TeammatesCard';
import { CountersCard } from '../components/CountersCard';
import { DominatesCard } from '../components/DominatesCard';
import { SpreadsCard } from '../components/SpreadsCard';
import { TeraTypesCard } from '../components/TeraTypesCard';
import type { PokemonStats } from '../types';
import { useRating } from '../contexts/RatingContext';
import { useQuery } from '@tanstack/react-query';
import { getPokemonData } from '../utils/api';

export default function Pokemon() {
  const { formatId, pokemonName } = useParams();
  const [searchParams] = useSearchParams();
  const { rating } = useRating();
  const [sidebarTarget, setSidebarTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSidebarTarget(document.getElementById('sidebar-dex-info'));
  }, []);

  const ratingParam = rating !== null ? rating : searchParams.get('rating');

  const { data, isLoading: loading, isFetching: isUpdating } = useQuery<PokemonStats>({
    queryKey: ['pokemon', formatId, pokemonName, ratingParam],
    queryFn: () => getPokemonData(formatId!, pokemonName!, typeof ratingParam === 'string' ? parseInt(ratingParam) : ratingParam),
    enabled: !!formatId && !!pokemonName
  });

  if (loading && !data) return <div className="p-8 text-center text-white text-xl font-light animate-pulse">Loading data...</div>;
  if (!data) return <div className="p-8 text-center text-white text-xl">Pokémon not found.</div>;

  return (
    <div className={`max-w-7xl mx-auto transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
      {sidebarTarget && createPortal(
        <div className={`animate-fade-in transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
          <PokemonHeader 
            name={data.name}
            rank={data.usage.rank}
            usage_percent={data.usage.usage_percent}
            types={data.types}
            possible_abilities={data.possible_abilities}
            base_stats={data.base_stats}
            rating={data.rating}
          />
        </div>,
        sidebarTarget
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          
          <MovesCard moves={data.moves} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ItemsCard items={data.items} />
            <AbilitiesCard abilities={data.abilities} />
            <TeraTypesCard teraTypes={data.tera_types} />
          </div>

          <SpreadsCard spreads={data.spreads} baseStats={data.base_stats} />
        </div>

        <div className="space-y-4">
          <TeammatesCard teammates={data.teammates} formatId={formatId || ''} />
          <DominatesCard dominates={data.dominates} formatId={formatId || ''} />
          <CountersCard counters={data.counters} formatId={formatId || ''} />
        </div>
      </div>
    </div>
  );
}

