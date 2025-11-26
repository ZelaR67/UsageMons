import React, { useState, useMemo } from 'react';

interface PokemonSpriteProps {
  name: string;
  className?: string;
}

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({ name, className }) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [prevName, setPrevName] = useState(name);

  if (name !== prevName) {
    setPrevName(name);
    setCurrentUrlIndex(0);
    setHasError(false);
  }

  const urls = useMemo(() => {
    const cleanName = name.toLowerCase();
    const stripped = cleanName.replace(/[^a-z0-9]/g, '');
    const hyphenated = cleanName.replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    const megaFixed = hyphenated.replace(/-mega-/g, '-mega');
    
    const candidates = [];

    if (stripped === 'urshifurapidstrike') {
        candidates.push('https://play.pokemonshowdown.com/sprites/ani/urshifu-rapidstrike.gif');
    }
    if (stripped === 'necrozmadawnwings') {
        candidates.push('https://play.pokemonshowdown.com/sprites/ani/necrozma-dawnwings.gif');
    }
    if (stripped === 'necrozmaduskmane') {
        candidates.push('https://play.pokemonshowdown.com/sprites/ani/necrozma-duskmane.gif');
    }

    candidates.push(
        `https://play.pokemonshowdown.com/sprites/ani/${stripped}.gif`,
        `https://play.pokemonshowdown.com/sprites/ani/${hyphenated}.gif`,
        `https://play.pokemonshowdown.com/sprites/ani/${megaFixed}.gif`,
        `https://play.pokemonshowdown.com/sprites/gen5/${stripped}.png`,
        `https://play.pokemonshowdown.com/sprites/gen5/${hyphenated}.png`,
        `https://play.pokemonshowdown.com/sprites/gen5/${megaFixed}.png`,
        `https://play.pokemonshowdown.com/sprites/dex/${stripped}.png`,
        `https://play.pokemonshowdown.com/sprites/dex/${hyphenated}.png`,
        `https://play.pokemonshowdown.com/sprites/dex/${megaFixed}.png`
    );
    
    return Array.from(new Set(candidates));
  }, [name]);

  const handleError = () => {
    if (currentUrlIndex < urls.length - 1) {
        setCurrentUrlIndex(prev => prev + 1);
    } else {
        setHasError(true);
    }
  };

  if (hasError) {
    return (
        <div className={`flex items-center justify-center text-gray-400 text-xs ${className}`}>
            ?
        </div>
    );
  }

  return (
    <img 
        src={urls[currentUrlIndex]} 
        alt={name} 
        className={className}
        onError={handleError}
        loading="lazy"
    />
  );
};
