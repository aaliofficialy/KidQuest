import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Star, Trophy, ArrowRight, Play } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { Difficulty, Language, ActivityCompletionData } from '../types/game';
import { VoiceReader } from './VoiceReader';
import { QuestionProvider } from '../lib/QuestionProvider';
import { LevelManager } from '../lib/LevelManager';

interface MathGameProps {
  levelNumber: number;
  lang: Language;
  onActivityComplete: (data: ActivityCompletionData) => void;
  onNextLevel: () => void;
}

export const MathGame: React.FC<MathGameProps> = ({ levelNumber, lang, onActivityComplete, onNextLevel }) => {
  const level = LevelManager.getLevel(levelNumber || 1);
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
  const [currentRound, setCurrentRound] = useState(0);
  const [starsReward, setStarsReward] = useState(0);
  const [xpReward, setXpReward] = useState(0);
  const [coinsReward, setCoinsReward] = useState(0);
  const startTime = useRef(Date.now());
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [question, setQuestion] = useState(QuestionProvider.getQuestion(level.category, level.difficulty, levelNumber));

  const maxRounds = 5;

  useEffect(() => {
    generateNewQuestion();
  }, [levelNumber, currentRound]);

  const generateNewQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setFeedback(null);
    setQuestion(QuestionProvider.getQuestion(level.category, level.difficulty, levelNumber));
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    
    if (option === question.answer) {
      AudioEngine.playSuccess();
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      AudioEngine.playError();
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    AudioEngine.playClick();
    if (currentRound + 1 < maxRounds) {
      setCurrentRound(prev => prev + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    setGameState('ended');
    AudioEngine.playLevelUp();
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime.current) / 1000);
    const isPerfect = score === maxRounds;
    
    // Reward logic based on difficulty
    const mult = level.difficulty === 'easy' ? 1 : level.difficulty === 'medium' ? 2 : 4;
    const stars = score * 1 * mult + (isPerfect ? 5 : 0);
    const xp = score * 15 * mult;
    const coins = score * 5 * mult;
    const accuracy = Math.round((score / maxRounds) * 100);
    
    setStarsReward(stars);
    setXpReward(xp);
    setCoinsReward(coins);
    
    onActivityComplete({ starsEarned: stars, xpEarned: xp, coinsEarned: coins, accuracy, timeTaken, category: level.category });
  };

  const restartGame = () => {
    AudioEngine.playClick();
    setGameState('playing');
    setCurrentRound(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setFeedback(null);
    startTime.current = Date.now();
  };

  const getSpeakText = () => {
    return question.question;
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="w-full flex justify-between items-center bg-white p-3 border-4 border-slate-900 rounded-2xl shadow">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
          <Calculator className="w-5 h-5 text-kid-green animate-kid-bounce" />
          {level.category.toUpperCase()} — {level.difficulty.toUpperCase()}
        </h3>
        <div className="flex items-center gap-2">
          <VoiceReader text={getSpeakText()} lang={lang} label="Listen 🔊" />
        </div>
      </div>

      {gameState === 'playing' ? (
        <div className="cartoon-card p-6 bg-white flex flex-col gap-6">
          <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Question {currentRound + 1} / {maxRounds}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                {question.question}
              </h2>
            </div>
          
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt;
              let btnStyle = 'bg-white hover:bg-slate-50 text-slate-800';
              if (isAnswered) {
                if (opt === question.answer) {
                  btnStyle = 'bg-green-400 border-green-600 text-slate-900 scale-102';
                } else if (isSelected) {
                  btnStyle = 'bg-red-300 border-red-500 text-slate-900 scale-98';
                } else {
                  btnStyle = 'bg-white text-slate-400 opacity-60';
                }
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isAnswered}
                  className={`cartoon-btn py-3 sm:py-4 px-4 text-base sm:text-lg font-bold ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {isAnswered && (
            <div className={`p-4 rounded-xl border-2 flex justify-between items-center ${feedback === 'correct' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">{feedback === 'correct' ? 'Correct!' : 'Oops!'}</span>
              </div>
              <button
                onClick={handleNext}
                className="cartoon-btn bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-4 py-2 text-xs flex items-center gap-1"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="cartoon-card p-6 bg-white text-center flex flex-col items-center gap-4">
          <div className="flex text-4xl gap-1">
            {Array.from({ length: Math.min(3, Math.ceil(starsReward / 20)) }).map((_, i) => <Star key={i} className="fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="text-2xl font-black text-slate-800">Level Complete!</h2>
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
               <div className="text-xs text-slate-500 font-bold">XP</div>
               <div className="text-xl font-black text-sky-700">+{xpReward}</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
               <div className="text-xs text-slate-500 font-bold">COINS</div>
               <div className="text-xl font-black text-amber-700">+{coinsReward}</div>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
               <div className="text-xs text-slate-500 font-bold">ACCURACY</div>
               <div className="text-xl font-black text-rose-700">{((score / maxRounds) * 100).toFixed(0)}%</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={onNextLevel}
              className="cartoon-btn bg-emerald-400 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl w-full"
            >
              Next Level
            </button>
            <button
              onClick={restartGame}
              className="cartoon-btn bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-2xl w-full"
            >
              Replay Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
