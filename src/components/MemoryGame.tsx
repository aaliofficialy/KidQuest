import React, { useState, useEffect } from 'react';
import { Brain, Star, Timer, RefreshCw, Trophy } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { Difficulty, Language } from '../types/game';
import { MEMORY_CARDS, TRANSLATIONS } from '../data/questions';

interface MemoryGameProps {
  difficulty: Difficulty;
  lang: Language;
  onActivityComplete: (starsEarned: number, badgeId?: string) => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ difficulty, lang, onActivityComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [starsReward, setStarsReward] = useState(0);
  const t = TRANSLATIONS[lang];

  // Initialize cards
  useEffect(() => {
    restartGame();
  }, [difficulty]);

  // Timer interval
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const restartGame = () => {
    AudioEngine.playClick();
    const sourceEmojis = MEMORY_CARDS[difficulty] || MEMORY_CARDS.easy;
    
    // Shuffle cards
    const shuffled: Card[] = [...sourceEmojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setSeconds(0);
    setIsFinished(false);
    setStarsReward(0);
  };

  const handleCardClick = (index: number) => {
    if (cards[index].isMatched || cards[index].isFlipped || flippedIndices.length >= 2 || isFinished) return;

    AudioEngine.playClick();

    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // MATCH!
        setTimeout(() => {
          AudioEngine.playSuccess();
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);

          // Check win condition
          if (matchedCards.every((c) => c.isMatched)) {
            handleWin();
          }
        }, 400);
      } else {
        // MISMATCH
        setTimeout(() => {
          AudioEngine.playError();
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleWin = () => {
    setIsFinished(true);
    AudioEngine.playLevelUp();

    // Calculate stars based on difficulty & speed
    let baseStars = difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40;
    
    // Bonus for speed
    let bonus = 0;
    if (seconds < 30) bonus = 15;
    else if (seconds < 60) bonus = 10;

    const totalReward = baseStars + bonus;
    setStarsReward(totalReward);

    // Badge condition: hard mode completed in < 45 seconds
    let badgeEarned: string | undefined = undefined;
    if (difficulty === 'hard' && seconds < 45) {
      badgeEarned = 'memory_master';
    }

    onActivityComplete(totalReward, badgeEarned);
  };

  return (
    <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto">
      {/* Game Header */}
      <div className="w-full flex justify-between items-center bg-white p-3 border-4 border-slate-900 rounded-2xl shadow">
        <div className="flex items-center gap-1">
          <Timer className="w-5 h-5 text-indigo-500 animate-pulse" />
          <span className="font-mono font-bold text-sm text-slate-700">
            {t.timerLeft}: <span className="text-indigo-600">{seconds}s</span>
          </span>
        </div>
        
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1">
          <Brain className="w-5 h-5 text-kid-purple" />
          {t.memory}
        </h3>

        <button
          onClick={restartGame}
          id="restart-memory-btn"
          className="cartoon-btn bg-yellow-300 text-slate-900 font-bold px-3 py-1.5 text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Grid of Cards */}
      <div className={`grid gap-3 w-full my-4 ${
        difficulty === 'easy' ? 'grid-cols-4' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-5'
      }`}>
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              id={`memory-card-${idx}`}
              className={`aspect-square rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer flex items-center justify-center text-4xl sm:text-5xl ${
                isRevealed 
                  ? 'bg-amber-50 transform rotate-y-180 scale-100' 
                  : 'bg-gradient-to-br from-indigo-400 to-sky-400 text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isRevealed ? (
                card.emoji
              ) : (
                <span className="font-bold text-white text-3xl select-none">?</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Win Modal Box */}
      {isFinished && (
        <div className="w-full bg-emerald-50 border-4 border-emerald-500 p-5 rounded-2xl text-center shadow animate-bounce-short">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
          <h4 className="text-xl font-bold text-emerald-800 mt-2">
            {t.completed}
          </h4>
          <p className="text-sm font-semibold text-emerald-700 mt-1">
            Moves: <span className="font-bold text-slate-800">{moves}</span> | Time: <span className="font-bold text-slate-800">{seconds}s</span>
          </p>

          <div className="flex justify-center items-center gap-2 my-3">
            <div className="bg-yellow-400 text-slate-900 border-2 border-slate-900 font-extrabold px-4 py-1.5 rounded-full flex items-center gap-1.5 text-lg shadow">
              <Star className="w-5 h-5 fill-slate-900 text-slate-900" />
              +{starsReward} Stars
            </div>
          </div>

          <button
            onClick={restartGame}
            id="play-again-memory-btn"
            className="cartoon-btn bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold px-6 py-2 text-sm mt-2"
          >
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};
