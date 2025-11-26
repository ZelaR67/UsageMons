import React, { createContext, useContext, useEffect, useState } from 'react';
import { getApiUrl } from '../utils/api';

interface MoveMeta {
  type: string;
  category: string;
  basePower: string | number;
  accuracy: string | number;
  desc: string;
}

interface ItemMeta {
  name: string;
  desc: string;
}

interface AbilityMeta {
  name: string;
  desc: string;
}

interface PokedexMeta {
  types: string[];
  baseStats: Record<string, number>;
  abilities: Record<string, string>;
}

interface MetadataContextType {
  moves: Record<string, MoveMeta>;
  items: Record<string, ItemMeta>;
  abilities: Record<string, AbilityMeta>;
  pokedex: Record<string, PokedexMeta>;
  loading: boolean;
}

const MetadataContext = createContext<MetadataContextType>({
  moves: {},
  items: {},
  abilities: {},
  pokedex: {},
  loading: true,
});

export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moves, setMoves] = useState({});
  const [items, setItems] = useState({});
  const [abilities, setAbilities] = useState({});
  const [pokedex, setPokedex] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movesRes, itemsRes, abilitiesRes, pokedexRes] = await Promise.all([
          fetch(getApiUrl('api/meta/moves')),
          fetch(getApiUrl('api/meta/items')),
          fetch(getApiUrl('api/meta/abilities')),
          fetch(getApiUrl('api/meta/pokedex'))
        ]);

        const movesData = await movesRes.json();
        const itemsData = await itemsRes.json();
        const abilitiesData = await abilitiesRes.json();
        const pokedexData = await pokedexRes.json();

        setMoves(movesData);
        setItems(itemsData);
        setAbilities(abilitiesData);
        setPokedex(pokedexData);
      } catch (error) {
        console.error("Failed to load metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MetadataContext.Provider value={{ moves, items, abilities, pokedex, loading }}>
      {children}
    </MetadataContext.Provider>
  );
};
