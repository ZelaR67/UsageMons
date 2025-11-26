import React, { createContext, useContext, useEffect, useState } from 'react';

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
        const [movesRes, itemsRes, abilitiesRes] = await Promise.all([
          fetch('/api/meta/moves'),
          fetch('/api/meta/items'),
          fetch('/api/meta/abilities')
        ]);

        const movesData = await movesRes.json();
        const itemsData = await itemsRes.json();
        const abilitiesData = await abilitiesRes.json();

        setMoves(movesData);
        setItems(itemsData);
        setAbilities(abilitiesData);
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
