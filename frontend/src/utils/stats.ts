export const NATURES: Record<string, [string, string] | null> = {
  Adamant: ['atk', 'spa'],
  Bashful: null,
  Bold: ['def', 'atk'],
  Brave: ['atk', 'spe'],
  Calm: ['spd', 'atk'],
  Careful: ['spd', 'spa'],
  Docile: null,
  Gentle: ['spd', 'def'],
  Hardy: null,
  Hasty: ['spe', 'def'],
  Impish: ['def', 'spa'],
  Jolly: ['spe', 'spa'],
  Lax: ['def', 'spd'],
  Lonely: ['atk', 'def'],
  Mild: ['spa', 'def'],
  Modest: ['spa', 'atk'],
  Naive: ['spe', 'spd'],
  Naughty: ['atk', 'spd'],
  Quiet: ['spa', 'spe'],
  Quirky: null,
  Rash: ['spa', 'spd'],
  Relaxed: ['def', 'spe'],
  Sassy: ['spd', 'spe'],
  Serious: null,
  Timid: ['spe', 'atk'],
};

export const STAT_NAMES = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export function calculateStats(baseStats: number[], evs: number[], nature: string, level: number = 100, ivs: number = 31): number[] {
  const stats = [];
  const natureMods = NATURES[nature];

  if (baseStats[0] === 1) {
    stats.push(1);
  } else {
    const hp = Math.floor((2 * baseStats[0] + ivs + Math.floor(evs[0] / 4)) * level / 100) + level + 10;
    stats.push(hp);
  }

  for (let i = 1; i < 6; i++) {
    let val = Math.floor((2 * baseStats[i] + ivs + Math.floor(evs[i] / 4)) * level / 100) + 5;
    
    if (natureMods) {
      if (natureMods[0] === STAT_NAMES[i]) {
        val = Math.floor(val * 1.1);
      } else if (natureMods[1] === STAT_NAMES[i]) {
        val = Math.floor(val * 0.9);
      }
    }
    stats.push(val);
  }

  return stats;
}
