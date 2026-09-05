import { Difficulty } from '../types/game';

export type Category = 'math' | 'english' | 'science' | 'gk' | 'memory' | 'puzzle';

export interface Level {
  id: number;
  world: number;
  category: Category;
  difficulty: Difficulty;
  unlockCost: { coins: number; stars: number };
}

const CATEGORIES: Category[] = ['math', 'english', 'science', 'gk', 'memory', 'puzzle'];

export const LevelManager = {
  getLevel: (id: number): Level => {
    const world = Math.floor((id - 1) / 20) + 1;
    const category = CATEGORIES[(world - 1) % CATEGORIES.length];
    let difficulty: Difficulty = 'easy';
    if (id > 300) difficulty = 'hard';
    else if (id > 100) difficulty = 'medium';

    return {
      id,
      world,
      category,
      difficulty,
      unlockCost: {
        coins: id * 50,
        stars: id * 10
      }
    };
  },
  isLastLevel: (id: number) => id >= 500,
};
