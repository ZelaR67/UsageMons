export interface Move {
  name: string;
  id: string;
  usage_percent: number;
}

export interface Item {
  name: string;
  id: string;
  usage_percent: number;
}

export interface Teammate {
  name: string;
  usage_percent: number;
}

export interface Counter {
  name: string;
  score: number;
}

export interface Spread {
  spread: string;
  usage_percent: number;
}

export interface TeraType {
  tera_type: string;
  usage_percent: number;
}

export interface PokemonStats {
  name: string;
  usage: {
    rank: number;
    usage_percent: number;
  };
  base_stats: number[];
  types: string[];
  possible_abilities: string[];
  moves: Move[];
  items: Item[];
  teammates: Teammate[];
  counters: Counter[];
  spreads: Spread[];
  abilities: Item[];
  natures: Item[];
  tera_types: TeraType[];
  dominates: Counter[];
  rating?: number;
}
