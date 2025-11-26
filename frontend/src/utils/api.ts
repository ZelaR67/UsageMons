import { supabase } from '../supabaseClient';

export const getFormats = async () => {
  const { data, error } = await supabase
    .from('formats')
    .select('id, name')
    .order('id');
  
  if (error) throw error;
  return data;
};

export const getFormatRatings = async (formatId: string) => {
  const { data, error } = await supabase
    .from('pokemon_stats')
    .select('rating')
    .eq('format_id', formatId);
    
  if (error) throw error;
  
  // Get unique ratings
  const ratings = [...new Set(data.map(item => item.rating))].sort((a, b) => a - b);
  return ratings;
};

export const getFormatData = async (formatId: string, rating: number | null) => {
  // Helper to get max rating
  const getMaxRating = async () => {
      const ratings = await getFormatRatings(formatId);
      if (ratings.length > 0) return ratings[0];
      throw new Error("No ratings found for format");
  };

  let targetRating = rating;
  
  if (!targetRating) {
      targetRating = await getMaxRating();
  }

  let { data, error } = await supabase
    .from('pokemon_stats')
    .select('pokemon_name, usage_percent, rank')
    .eq('format_id', formatId)
    .eq('rating', targetRating)
    .order('rank');
    
  // Fallback logic: if no data found, try max rating
  if (!error && (!data || data.length === 0)) {
      const maxRating = await getMaxRating();
      if (targetRating !== maxRating) {
          targetRating = maxRating;
          const result = await supabase
            .from('pokemon_stats')
            .select('pokemon_name, usage_percent, rank')
            .eq('format_id', formatId)
            .eq('rating', targetRating)
            .order('rank');
          data = result.data;
          error = result.error;
      }
  }
    
  if (error) throw error;
  
  const pokemon = (data || []).map(p => ({
    name: p.pokemon_name,
    usage_percent: p.usage_percent,
    rank: p.rank
  }));

  return {
    format: formatId,
    rating: targetRating,
    pokemon: pokemon
  };
};

export const getPokemonData = async (formatId: string, pokemonSlug: string, rating: number | null) => {
  const getMaxRating = async () => {
      const ratings = await getFormatRatings(formatId);
      if (ratings.length > 0) return ratings[0];
      throw new Error("No ratings found for format");
  };

  let targetRating = rating;
  
  if (!targetRating) {
      targetRating = await getMaxRating();
  }

  let { data, error } = await supabase
    .from('pokemon_stats')
    .select('*')
    .eq('format_id', formatId)
    .eq('slug', pokemonSlug)
    .eq('rating', targetRating)
    .single();
    
  // Fallback logic: if error (likely row not found) or no data, try max rating
  if (error || !data) {
       const maxRating = await getMaxRating();
       if (targetRating !== maxRating) {
           targetRating = maxRating;
           const result = await supabase
            .from('pokemon_stats')
            .select('*')
            .eq('format_id', formatId)
            .eq('slug', pokemonSlug)
            .eq('rating', targetRating)
            .single();
            data = result.data;
            error = result.error;
       }
  }
    
  if (error) throw error;
  return { ...data, ...data.data };
};

// Metadata functions
export const getMoves = async () => {
    const { data, error } = await supabase.from('moves').select('*');
    if (error) throw error;
    return data;
}

export const getItems = async () => {
    const { data, error } = await supabase.from('items').select('*');
    if (error) throw error;
    return data;
}

export const getAbilities = async () => {
    const { data, error } = await supabase.from('abilities').select('*');
    if (error) throw error;
    return data;
}

