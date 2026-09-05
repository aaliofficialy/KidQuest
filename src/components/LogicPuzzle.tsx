import React, { useState, useEffect } from 'react';
import { HelpCircle, Star, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { Difficulty, Language } from '../types/game';
import { TRANSLATIONS, LOGIC_PUZZLES } from '../data/questions';
import { VoiceReader } from './VoiceReader';

interface LogicPuzzleProps {
  difficulty: Difficulty;
  lang: Language;
  onActivityComplete: (starsEarned: number, badgeId?: string) => void;
}

export const LogicPuzzle: React.FC<LogicPuzzleProps> = ({ difficulty, lang, onActivityComplete }) => {
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [starsReward, setStarsReward] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const puzzles = LOGIC_PUZZLES.filter(p => p.difficulty === difficulty || difficulty === 'hard');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    initRound();
  }, [difficulty, currentRound]);

  const initRound = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
  };

  const currentP = puzzles[currentRound % (puzzles.length || 1)];

  const handleOptionClick = (option: string) => {
    if (isAnswered || !currentP) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentP.answer) {
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
    const totalP = puzzles.length;

    if (currentRound + 1 < totalP) {
      setCurrentRound(prev => prev + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    setGameState('ended');
    AudioEngine.playLevelUp();

    const isPerfect = score === puzzles.length;
    let baseStars = score * 15;
    let perfectBonus = isPerfect ? 20 : 0;
    const total = baseStars + perfectBonus;
    setStarsReward(total);

    onActivityComplete(total);
  };

  const restartGame = () => {
    AudioEngine.playClick();
    setGameState('playing');
    setCurrentRound(0);
    setScore(0);
  };

  if (!currentP) {
    return (
      <div className="text-center p-6 bg-white rounded-2xl border-2 border-slate-900">
        <p className="font-bold">No puzzle found for this difficulty. Try another level!</p>
      </div>
    );
  }

  const getSpeakText = () => {
    return lang === 'es' ? currentP.instructionEs : lang === 'fr' ? currentP.instructionFr : currentP.instructionEn;
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Game Head */}
      <div className="w-full flex justify-between items-center bg-white p-3 border-4 border-slate-900 rounded-2xl shadow">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
          <HelpCircle className="w-5 h-5 text-kid-orange animate-pulse" />
          {t.puzzle} — {difficulty === 'easy' ? t.easy.split(' ')[0] : difficulty === 'medium' ? t.medium.split(' ')[0] : t.hard.split(' ')[0]}
        </h3>
        <VoiceReader text={getSpeakText()} lang={lang} label="Listen 🔊" />
      </div>

      {gameState === 'playing' ? (
        <div className="cartoon-card p-6 bg-white flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Logic Puzzle {currentRound + 1} / {puzzles.length}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              {lang === 'es' ? currentP.instructionEs : lang === 'fr' ? currentP.instructionFr : currentP.instructionEn}
            </h2>
          </div>

          {/* Large display pattern visualizer box */}
          <div className="bg-amber-50/50 p-6 rounded-2xl border-2 border-dashed border-slate-400 flex justify-center items-center text-4xl select-none min-h-[100px]">
            {difficulty === 'easy' && currentRound === 0 && (
              <span className="animate-kid-bounce">🔴 🔵 🔴 🔵 ❓ 🔵</span>
            )}
            {difficulty === 'hard' && currentRound === 0 && (
              <span className="animate-kid-bounce">🔺 🟥 🔺 🟥 🔺 ❓</span>
            )}
            {!(difficulty === 'easy' && currentRound === 0) && !(difficulty === 'hard' && currentRound === 0) && (
              <span className="text-4xl animate-pulse">🧩💡</span>
            )}
          </div>

          {/* Options buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentP.options.map((opt) => {
              const isSelected = selectedOption === opt;
              let btnStyle = 'bg-white hover:bg-slate-50 text-slate-800 text-2xl';

              if (isAnswered) {
                if (opt === currentP.answer) {
                  btnStyle = 'bg-green-400 border-green-600 text-slate-900 font-extrabold text-2xl scale-102';
                } else if (isSelected) {
                  btnStyle = 'bg-red-300 border-red-500 text-slate-900 text-2xl';
                } else {
                  btnStyle = 'bg-slate-100 text-slate-300 border-slate-200 shadow-none';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isAnswered}
                  id={`logic-option-${opt}`}
                  className={`cartoon-btn p-4 flex items-center justify-center font-bold ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Option Answer Feedbacks */}
          {isAnswered && (
            <div className="p-5 rounded-2xl border-4 border-slate-900 bg-[#FFFDF4] flex flex-col gap-3 relative shadow-[4px_4px_0px_0px_#0f172a]">
              <div className="flex justify-between items-center">
                <span className={`text-lg font-extrabold uppercase ${
                  feedback === 'correct' ? 'text-green-600' : 'text-rose-500'
                }`}>
                  {feedback === 'correct' ? t.correct : t.wrong}
                </span>

                <button
                  onClick={handleNext}
                  id="logic-next-btn"
                  className="cartoon-btn bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  {t.next} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {currentP.funFactEn && (
                <div className="pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                    {t.funFact}
                  </h4>
                  <p className="text-sm font-medium text-slate-700 italic mt-1 leading-relaxed">
                    {lang === 'es' ? currentP.funFactEs : lang === 'fr' ? currentP.funFactFr : currentP.funFactEn}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* End Screen Puzzle */
        <div className="cartoon-card p-6 bg-white text-center flex flex-col items-center gap-4">
          <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-800">
            {score === puzzles.length ? t.perfect : t.greatJob}
          </h2>
          <p className="text-sm font-semibold text-slate-600">
            Brilliant puzzle skills! You scored <span className="text-indigo-600 font-bold text-lg">{score}</span> out of{' '}
            <span className="font-bold text-lg">{puzzles.length}</span> correct blocks!
          </p>

          <div className="bg-yellow-400 text-slate-900 border-2 border-slate-900 font-extrabold px-6 py-2 rounded-full flex items-center gap-1.5 text-xl shadow my-2 animate-pulse">
            <Star className="w-6 h-6 fill-slate-900 text-slate-900" />
            +{starsReward} Stars
          </div>

          <button
            onClick={restartGame}
            id="logic-play-again-btn"
            className="cartoon-btn bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold px-8 py-3 text-sm mt-2"
          >
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};
