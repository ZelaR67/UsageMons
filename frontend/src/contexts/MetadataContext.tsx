import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMoves, getItems, getAbilities } from '../utils/api';

interface MoveMeta {
  type: string;
  category: string;
  basePower: string | number;
  accuracy: string | number;
  desc: string;
  shortDesc?: string;
}

interface ItemMeta {
  name: string;
  desc: string;
  shortDesc?: string;
}

interface AbilityMeta {
  name: string;
  desc: string;
  shortDesc?: string;
}

interface MetadataContextType {
  moves: Record<string, MoveMeta>;
  items: Record<string, ItemMeta>;
  abilities: Record<string, AbilityMeta>;
  loading: boolean;
}

const MetadataContext = createContext<MetadataContextType>({
  moves: {},
  items: {},
  abilities: {},
  loading: true,
});

export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moves, setMoves] = useState({});
  const [items, setItems] = useState({});
  const [abilities, setAbilities] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movesData, itemsData, abilitiesData] = await Promise.all([
          getMoves(),
          getItems(),
          getAbilities()
        ]);

        const movesMap = movesData.reduce((acc: any, move: any) => {
            acc[move.id] = {
                type: move.type,
                category: move.category,
                basePower: move.base_power,
                accuracy: move.accuracy,
                desc: move.description
            };
            return acc;
        }, {});

        const itemsMap = itemsData.reduce((acc: any, item: any) => {
            acc[item.id] = {
                name: item.name,
                desc: item.description
            };
            return acc;
        }, {});

        const abilitiesMap = abilitiesData.reduce((acc: any, ability: any) => {
            acc[ability.id] = {
                name: ability.name,
                desc: ability.description
            };
            return acc;
        }, {});

        setMoves(movesMap);
        setItems(itemsMap);
        setAbilities(abilitiesMap);
      } catch (error) {
        console.error("Failed to load metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MetadataContext.Provider value={{ moves, items, abilities, loading }}>
      {children}
    </MetadataContext.Provider>
  );
};
