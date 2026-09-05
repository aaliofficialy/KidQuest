export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'en' | 'es' | 'fr';

export interface GameHistory {
  id: string;
  category: string; // 'math' | 'english' | 'science' | 'gk' | 'memory' | 'puzzle' | 'drawing'
  score: number;
  totalQuestions: number;
  difficulty: Difficulty;
  date: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string; // Key or emoji
  age: number;
  level: Difficulty;
  levelNumber: number; // 1+
  highestUnlockedLevel: number;
  totalXP: number;
  totalCoins: number;
  totalStars: number;
  dailyStreak: number;
  lastLogin: string;
  completedLessons: string[]; // Activities completed
  badges: string[]; // Badge IDs earned
  history: GameHistory[];
  inventory: string[];
}

export interface Badge {
  id: string;
  nameEn: string;
  nameEs: string;
  nameFr: string;
  descriptionEn: string;
  descriptionEs: string;
  descriptionFr: string;
  icon: string; // Lucide icon name string
  color: string; // tailwind color class
  requirement: string;
}

export interface QuizQuestion {
  id: string;
  category: 'science' | 'gk' | 'math' | 'english';
  difficulty: Difficulty;
  questionEn: string;
  questionEs: string;
  questionFr: string;
  optionsEn: string[];
  optionsEs: string[];
  optionsFr: string[];
  answerEn: string;
  answerEs: string;
  answerFr: string;
  funFactEn?: string;
  funFactEs?: string;
  funFactFr?: string;
}

export interface DailyChallenge {
  id: string;
  category: string;
  descriptionEn: string;
  descriptionEs: string;
  descriptionFr: string;
  targetStars: number;
  completed: boolean;
}

export interface ActivityCompletionData {
  starsEarned: number;
  xpEarned: number;
  coinsEarned: number;
  accuracy: number;
  timeTaken: number; // in seconds
  badgeId?: string;
  category: string;
}
