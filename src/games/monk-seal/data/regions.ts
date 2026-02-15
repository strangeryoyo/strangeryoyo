import { Region } from '../types';

export const initialRegions: Region[] = [
  // Pacific
  { id: 'gpgp', name: 'Great Pacific Garbage Patch', description: 'A massive vortex of floating plastic debris', pollution: 100, maxPollution: 100, unlocked: true, cleaned: false, cx: 180, cy: 180, enemyPool: ['plastic-kraken', 'bottle-swarm', 'bag-jellyfish'], difficulty: 2 },
  { id: 'hawaii', name: 'Hawaiian Islands', description: 'Home of the Hawaiian monk seal', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 130, cy: 200, enemyPool: ['ghost-net', 'soda-clan', 'plastic-kraken'], difficulty: 1 },
  { id: 'galapagos', name: 'Gal\u00e1pagos Islands', description: 'Unique wildlife threatened by ocean debris', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 230, cy: 270, enemyPool: ['oil-slick', 'bottle-swarm', 'micro-swarm'], difficulty: 2 },
  { id: 'barrier-reef', name: 'Great Barrier Reef', description: 'The world\'s largest coral reef system', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 640, cy: 300, enemyPool: ['chemical-cloud', 'ghost-net', 'micro-swarm'], difficulty: 2 },
  { id: 'mariana', name: 'Mariana Trench', description: 'The deepest point in the ocean', pollution: 100, maxPollution: 100, unlocked: false, cleaned: false, cx: 600, cy: 200, enemyPool: ['deep-lurker', 'plastic-kraken', 'chemical-cloud'], difficulty: 3, requiredTool: 'robo-sub' },

  // Atlantic
  { id: 'caribbean', name: 'Caribbean Sea', description: 'Tropical waters choked with runoff pollution', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 270, cy: 230, enemyPool: ['soda-clan', 'bag-jellyfish', 'oil-slick'], difficulty: 1 },
  { id: 'sargasso', name: 'Sargasso Sea', description: 'Floating seaweed sea trapping plastic', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 330, cy: 200, enemyPool: ['ghost-net', 'bottle-swarm', 'bag-jellyfish'], difficulty: 2 },
  { id: 'gulf-mexico', name: 'Gulf of Mexico', description: 'Plagued by oil spills and dead zones', pollution: 100, maxPollution: 100, unlocked: true, cleaned: false, cx: 250, cy: 210, enemyPool: ['oil-slick', 'chemical-cloud', 'soda-clan'], difficulty: 2 },
  { id: 'north-atlantic', name: 'North Atlantic Gyre', description: 'Swirling currents collecting debris', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 370, cy: 160, enemyPool: ['plastic-kraken', 'micro-swarm', 'bottle-swarm'], difficulty: 2 },

  // Indian Ocean
  { id: 'maldives', name: 'Maldives', description: 'Low-lying islands threatened by rising seas and waste', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 545, cy: 260, enemyPool: ['bag-jellyfish', 'soda-clan', 'ghost-net'], difficulty: 1 },
  { id: 'indian-gyre', name: 'Indian Ocean Gyre', description: 'A growing garbage patch in the Indian Ocean', pollution: 100, maxPollution: 100, unlocked: true, cleaned: false, cx: 520, cy: 300, enemyPool: ['plastic-kraken', 'bottle-swarm', 'micro-swarm'], difficulty: 3 },

  // Mediterranean & European
  { id: 'mediterranean', name: 'Mediterranean Sea', description: 'One of the most polluted seas on Earth', pollution: 100, maxPollution: 100, unlocked: true, cleaned: false, cx: 430, cy: 180, enemyPool: ['oil-slick', 'chemical-cloud', 'ghost-net'], difficulty: 2 },
  { id: 'north-sea', name: 'North Sea', description: 'Heavy shipping lanes causing chronic pollution', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 400, cy: 135, enemyPool: ['oil-slick', 'micro-swarm', 'chemical-cloud'], difficulty: 2 },
  { id: 'baltic', name: 'Baltic Sea', description: 'Semi-enclosed sea with eutrophication problems', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 425, cy: 125, enemyPool: ['chemical-cloud', 'ghost-net', 'soda-clan'], difficulty: 2 },

  // Arctic & Southern
  { id: 'arctic', name: 'Arctic Ocean', description: 'Melting ice revealing decades of trapped pollution', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 400, cy: 60, enemyPool: ['micro-swarm', 'oil-slick', 'bottle-swarm'], difficulty: 3 },

  // Asian & African
  { id: 'south-china', name: 'South China Sea', description: 'Heavily trafficked waters with massive waste', pollution: 100, maxPollution: 100, unlocked: true, cleaned: false, cx: 620, cy: 230, enemyPool: ['plastic-kraken', 'soda-clan', 'bottle-swarm'], difficulty: 2 },
  { id: 'bay-bengal', name: 'Bay of Bengal', description: 'River runoff carries pollution from major cities', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 565, cy: 230, enemyPool: ['chemical-cloud', 'bag-jellyfish', 'ghost-net'], difficulty: 2 },
  { id: 'coral-triangle', name: 'Coral Triangle', description: 'Most biodiverse marine area on Earth', pollution: 75, maxPollution: 75, unlocked: true, cleaned: false, cx: 650, cy: 270, enemyPool: ['ghost-net', 'micro-swarm', 'oil-slick'], difficulty: 2 },

  // Deep ocean (locked)
  { id: 'deep-atlantic', name: 'Deep Atlantic Trench', description: 'Even the deep sea is not safe from pollution', pollution: 100, maxPollution: 100, unlocked: false, cleaned: false, cx: 340, cy: 270, enemyPool: ['deep-lurker', 'plastic-kraken', 'micro-swarm'], difficulty: 3, requiredTool: 'robo-sub' },
  { id: 'antarctic', name: 'Antarctic Waters', description: 'Remote but increasingly polluted polar seas', pollution: 75, maxPollution: 75, unlocked: false, cleaned: false, cx: 400, cy: 420, enemyPool: ['deep-lurker', 'oil-slick', 'chemical-cloud'], difficulty: 3, requiredTool: 'robo-sub' },
];
