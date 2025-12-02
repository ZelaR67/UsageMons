import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

import { Sidebar } from '../components/Sidebar';
import { PokemonHeader } from '../components/PokemonHeader';
import { MovesCard } from '../components/MovesCard';
import { ItemsCard } from '../components/ItemsCard';
import { AbilitiesCard } from '../components/AbilitiesCard';
import { TeammatesCard } from '../components/TeammatesCard';
import { MatchupsCard } from '../components/MatchupsCard';
import { SpreadsCard } from '../components/SpreadsCard';
import { TeraTypesCard } from '../components/TeraTypesCard';
import { MobileBuildCard } from '../components/MobileBuildCard';
import type { PokemonStats } from '../types';
import { useRating } from '../contexts/RatingContext';
import { useQuery } from '@tanstack/react-query';
import { getPokemonData, getFormatData } from '../utils/api';
import { useMobile } from '../contexts/MobileContext';

export default function Pokemon() {
  const { formatId, pokemonName } = useParams();
  const [searchParams] = useSearchParams();
  const { rating } = useRating();
  const [sidebarTarget, setSidebarTarget] = useState<HTMLElement | null>(null);
  const { isMobile, currentSlide, setCurrentSlide, setTotalSlides, setSlideTitles } = useMobile();
  const [buildTab, setBuildTab] = useState<'items' | 'abilities' | 'tera'>('items');
  
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const itemsRef = useRef<HTMLButtonElement>(null);
  const abilitiesRef = useRef<HTMLButtonElement>(null);
  const teraRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const updateUnderline = (tab: 'items' | 'abilities' | 'tera') => {
    const activeRef = tab === 'items' ? itemsRef : tab === 'abilities' ? abilitiesRef : teraRef;
    if (activeRef.current) {
      setUnderlineStyle({
        left: activeRef.current.offsetLeft,
        width: activeRef.current.offsetWidth
      });
    }
  };

  const handleTabChange = (tab: 'items' | 'abilities' | 'tera') => {
    setBuildTab(tab);
    updateUnderline(tab);
  };

  useEffect(() => {
    const update = () => {
      const activeRef = buildTab === 'items' ? itemsRef : buildTab === 'abilities' ? abilitiesRef : teraRef;
      if (activeRef.current) {
        setUnderlineStyle({
          left: activeRef.current.offsetLeft,
          width: activeRef.current.offsetWidth
        });
      }
    };
    
    update();
    // Recalculate after a short delay to ensure layout is stable
    const timer = setTimeout(update, 100);
    return () => clearTimeout(timer);
  }, [buildTab, isMobile, currentSlide]); // Recalculate on tab change, mobile view toggle, or slide change

  useEffect(() => {
    setTotalSlides(6);
    setSlideTitles(['Overview', 'Moves', 'Build', 'Spreads', 'Teammates', 'Matchups']);
  }, [setTotalSlides, setSlideTitles]);

  // Sync external currentSlide changes to Swiper
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== currentSlide) {
      swiperRef.current.slideTo(currentSlide);
    }
  }, [currentSlide]);

  useEffect(() => {
    const updateSidebarTarget = () => {
      const element = document.getElementById('sidebar-dex-info');
      if (element) {
        setSidebarTarget(element);
      }
    };

    updateSidebarTarget();
    
    // Retry a few times to ensure we catch the element after Swiper/Layout renders
    const interval = setInterval(updateSidebarTarget, 100);
    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isMobile]); // Re-run when switching view modes to capture the new element instance

  const ratingParam = rating !== null ? rating : searchParams.get('rating');
  const numericRating = typeof ratingParam === 'string' ? parseInt(ratingParam) : ratingParam;

  const { data, isLoading: loading, isFetching: isUpdating } = useQuery<PokemonStats>({
    queryKey: ['pokemon', formatId, pokemonName, numericRating],
    queryFn: () => getPokemonData(formatId!, pokemonName!, numericRating),
    enabled: !!formatId && !!pokemonName
  });

  const { data: formatData } = useQuery({
    queryKey: ['pokemonList', formatId, numericRating],
    queryFn: () => getFormatData(formatId!, numericRating),
    enabled: !!formatId
  });

  const globalUsageMap = formatData?.pokemon.reduce((acc: Record<string, number>, p: any) => {
    acc[p.name] = p.usage_percent;
    return acc;
  }, {}) || {};

  if (loading && !data) return <div className="p-8 text-center text-white text-xl font-light animate-pulse">Loading data...</div>;
  if (!data) return <div className="p-8 text-center text-white text-xl">Pokémon not found.</div>;

  const slides = [
    { 
      id: 0, 
      content: (
        <div className="h-full overflow-y-auto p-4">
          <Sidebar />
        </div>
      ) 
    },
    { id: 1, content: <MovesCard moves={data.moves} /> },
    { id: 2, content: (
          <div className="flex flex-col h-full glass-card p-4">
            <div className="mb-4 border-b pb-4 border-gray-200/50 dark:border-white/10 shrink-0">
              <div className="flex justify-around w-full relative">
                <button
                  ref={itemsRef}
                  onClick={() => handleTabChange('items')}
                  className={`pb-2 text-sm font-bold transition-colors duration-200 ${
                    buildTab === 'items' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  Items
                </button>
                <button
                  ref={abilitiesRef}
                  onClick={() => handleTabChange('abilities')}
                  className={`pb-2 text-sm font-bold transition-colors duration-200 ${
                    buildTab === 'abilities' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  Abilities
                </button>
                <button
                  ref={teraRef}
                  onClick={() => handleTabChange('tera')}
                  className={`pb-2 text-sm font-bold transition-colors duration-200 ${
                    buildTab === 'tera' 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  Tera Types
                </button>
                
                {/* Animated Underline */}
                <div 
                  className="absolute bottom-0 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300 ease-out"
                  style={{
                    left: underlineStyle.left,
                    width: underlineStyle.width
                  }}
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
               {buildTab === 'items' && <MobileBuildCard type="items" data={data.items} />}
               {buildTab === 'abilities' && <MobileBuildCard type="abilities" data={data.abilities} />}
               {buildTab === 'tera' && <MobileBuildCard type="tera" data={data.tera_types} />}
            </div>
          </div>
        )
    },
    { id: 3, content: <SpreadsCard spreads={data.spreads} baseStats={data.base_stats} /> },
    { id: 4, content: (
          <TeammatesCard 
            teammates={data.teammates} 
            formatId={formatId || ''} 
            globalUsageMap={globalUsageMap}
          />
        )
    },
    { id: 5, content: (
          <MatchupsCard 
            dominates={data.dominates} 
            counters={data.counters} 
            formatId={formatId || ''} 
          />
        )
    }
  ];

  if (isMobile) {
    return (
      <div className={`h-full flex flex-col transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
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
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              // Initialize swiper to current slide if needed
              if (swiper.activeIndex !== currentSlide) {
                swiper.slideTo(currentSlide, 0);
              }
            }}
            onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
            initialSlide={currentSlide}
            className="h-full"
            spaceBetween={10}
            touchStartPreventDefault={false}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id} className="h-full overflow-y-auto px-2">
                {slide.content}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  }

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
          <TeammatesCard 
            teammates={data.teammates} 
            formatId={formatId || ''} 
            globalUsageMap={globalUsageMap}
          />
          <MatchupsCard 
            dominates={data.dominates} 
            counters={data.counters} 
            formatId={formatId || ''} 
          />
        </div>
      </div>
    </div>
  );
}

