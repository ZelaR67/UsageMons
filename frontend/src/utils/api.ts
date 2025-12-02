import { getIndexDb, getFormatDb } from '../db';

export const getFormats = async () => {
  const worker = await getIndexDb();
  const result = await worker.db.query(`
    SELECT id, name, total_battles 
    FROM formats 
    ORDER BY total_battles DESC
  `);
  return result;
};

export const getFormatRatings = async (formatId: string) => {
  const worker = await getIndexDb();
  const result = await worker.db.query(`
    SELECT DISTINCT rating 
    FROM rankings 
    WHERE format_id = ? 
    ORDER BY rating ASC
  `, [formatId]);
  
  return result.map((r: any) => r.rating);
};

export const getFormatData = async (formatId: string, rating: number | null) => {
  const worker = await getIndexDb();
  
  // Helper to get max rating
  const getMaxRating = async () => {
      const ratings = await getFormatRatings(formatId);
      if (ratings.length > 0) return ratings[ratings.length - 1]; // ratings are sorted ASC
      throw new Error("No ratings found for format");
  };

  let targetRating = rating;
  
  if (targetRating === null) {
      targetRating = await getMaxRating();
  }

  let data = await worker.db.query(`
    SELECT pokemon_name, usage_percent, rank, slug
    FROM rankings 
    WHERE format_id = ? AND rating = ? 
    ORDER BY rank ASC
  `, [formatId, targetRating]);
    
  // Fallback logic: if no data found, try max rating
  if (!data || data.length === 0) {
      const maxRating = await getMaxRating();
      if (targetRating !== maxRating) {
          targetRating = maxRating;
          data = await worker.db.query(`
            SELECT pokemon_name, usage_percent, rank, slug
            FROM rankings 
            WHERE format_id = ? AND rating = ? 
            ORDER BY rank ASC
          `, [formatId, targetRating]);
      }
  }
  
  const pokemon = (data || []).map((p: any) => ({
    name: p.pokemon_name,
    usage_percent: p.usage_percent,
    rank: p.rank,
    slug: p.slug
  }));

  return {
    format: formatId,
    rating: targetRating,
    pokemon: pokemon
  };
};

export const getPokemonData = async (formatId: string, pokemonSlug: string, rating: number | null) => {
  // First get the pokemon name from the slug using the Index DB (Rankings)
  // This is safer than trying to guess the name from the slug
  const indexWorker = await getIndexDb();
  
  const getMaxRating = async () => {
      const ratings = await getFormatRatings(formatId);
      if (ratings.length > 0) return ratings[ratings.length - 1];
      throw new Error("No ratings found for format");
  };

  let targetRating = rating;
  if (targetRating === null) {
      targetRating = await getMaxRating();
  }

  // Find the pokemon name from the slug
  const rankingResult = await indexWorker.db.query(`
    SELECT pokemon_name 
    FROM rankings 
    WHERE format_id = ? AND slug = ? AND rating = ?
  `, [formatId, pokemonSlug, targetRating]);

  let pokemonName = rankingResult[0]?.pokemon_name;

  // Fallback if not found at this rating
  if (!pokemonName) {
      const maxRating = await getMaxRating();
      if (targetRating !== maxRating) {
          targetRating = maxRating;
          const fallbackResult = await indexWorker.db.query(`
            SELECT pokemon_name 
            FROM rankings 
            WHERE format_id = ? AND slug = ? AND rating = ?
          `, [formatId, pokemonSlug, targetRating]);
          pokemonName = fallbackResult[0]?.pokemon_name;
      }
  }

  if (!pokemonName) throw new Error("Pokemon not found in rankings");

  // Now fetch the details from the Format DB
  const formatWorker = await getFormatDb(formatId);
  
  let result = await formatWorker.db.query(`
    SELECT * 
    FROM pokemon_details 
    WHERE pokemon_name = ? AND rating = ?
  `, [pokemonName, targetRating]);
  
  let data = result[0];
    
  if (!data) throw new Error("Pokemon details not found");
  
  // Parse the JSON data column
  const parsedData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
  
  return { ...data, ...parsedData, slug: pokemonSlug };
};

// Metadata functions
export const getMoves = async () => {
    const worker = await getIndexDb();
    const result = await worker.db.query('SELECT * FROM moves');
    return result;
}

export const getItems = async () => {
    const worker = await getIndexDb();
    const result = await worker.db.query('SELECT * FROM items');
    return result;
}

export const getAbilities = async () => {
    const worker = await getIndexDb();
    const result = await worker.db.query('SELECT * FROM abilities');
    return result;
}

