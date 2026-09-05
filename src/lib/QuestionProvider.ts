import { Difficulty } from '../types/game';
import { Category } from './LevelManager';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: string;
}

export const QuestionProvider = {
  getQuestion: (category: Category, difficulty: Difficulty, levelId: number): Question => {
    // Procedural generation logic based on category/difficulty
    if (category === 'math') {
      const num1 = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100)) + 1;
      const num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100)) + 1;
      const op = Math.random() > 0.5 ? '+' : '-';
      const answer = op === '+' ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
      
      return {
        id: `math_${levelId}_${Date.now()}`,
        category,
        difficulty,
        question: `What is ${Math.max(num1, num2)} ${op} ${Math.min(num1, num2)}?`,
        options: [answer.toString(), (answer + 5).toString(), (answer - 2).toString(), (answer + 10).toString()].sort(() => Math.random() - 0.5),
        answer: answer.toString()
      };
    }
    
    // Default fallback
    return {
      id: `def_${levelId}_${Date.now()}`,
      category,
      difficulty,
      question: "What is 1 + 1?",
      options: ["2", "3", "4", "5"],
      answer: "2"
    };
  }
};
