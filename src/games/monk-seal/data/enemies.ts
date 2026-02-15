import { EnemyTemplate } from '../types';

export const enemyTemplates: EnemyTemplate[] = [
  { id: 'plastic-kraken', name: 'Plastic Kraken', emoji: '\ud83d\udc19', baseHp: 60, baseAtk: 12, category: 'pollution', dialogue: 'I am made of a thousand tangled bottles!' },
  { id: 'ghost-net', name: 'Ghost Net', emoji: '\ud83d\udd78\ufe0f', baseHp: 50, baseAtk: 10, category: 'pollution', dialogue: 'Lost at sea, I still trap everything in my path...' },
  { id: 'oil-slick', name: 'Oil Slick', emoji: '\ud83d\udee2\ufe0f', baseHp: 55, baseAtk: 14, category: 'pollution', dialogue: 'I spread across the surface, choking all life!' },
  { id: 'soda-clan', name: 'Soda Can Clan', emoji: '\ud83e\udd64', baseHp: 40, baseAtk: 8, category: 'recycling', dialogue: 'We never decompose! The beach is ours!' },
  { id: 'bottle-swarm', name: 'Bottle Swarm', emoji: '\ud83e\uddf4', baseHp: 45, baseAtk: 9, category: 'recycling', dialogue: '450 years and counting! We\'re not going anywhere!' },
  { id: 'bag-jellyfish', name: 'Plastic Bag Jellyfish', emoji: '\ud83d\udc9c', baseHp: 35, baseAtk: 11, category: 'marine-life', dialogue: 'Turtles think I\'m food... how sad for them!' },
  { id: 'chemical-cloud', name: 'Chemical Runoff', emoji: '\u2623\ufe0f', baseHp: 55, baseAtk: 13, category: 'pollution', dialogue: 'Farm chemicals and factory waste fuel my power!' },
  { id: 'micro-swarm', name: 'Microplastic Swarm', emoji: '\u2728', baseHp: 65, baseAtk: 10, category: 'pollution', dialogue: 'You can\'t even see us, but we\'re everywhere!' },
  { id: 'deep-lurker', name: 'Abyssal Trash Beast', emoji: '\ud83d\udc7e', baseHp: 80, baseAtk: 16, category: 'oceans', dialogue: 'Even the deepest trenches cannot escape pollution!' },
];

export function getEnemyTemplate(id: string): EnemyTemplate | undefined {
  return enemyTemplates.find(e => e.id === id);
}
