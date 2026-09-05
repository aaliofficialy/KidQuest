import React, { useState, useEffect } from 'react';
import { Globe, Star, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { Difficulty, Language } from '../types/game';
import { TRANSLATIONS, QUIZ_QUESTIONS } from '../data/questions';
import { VoiceReader } from './VoiceReader';

interface GKGameProps {
  difficulty: Difficulty;
  lang: Language;
  onActivityComplete: (starsEarned: number, badgeId?: string) => void;
}

export const GKGame: React.FC<GKGameProps> = ({ difficulty, lang, onActivityComplete }) => {
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [starsReward, setStarsReward] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const gkQuestions = QUIZ_QUESTIONS.filter(
    (q) => q.category === 'gk' && (q.difficulty === difficulty || difficulty === 'hard')
  );

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    initQuestion();
  }, [difficulty, currentRound]);

  const initQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
  };

  const currentQ = gkQuestions[currentRound % (gkQuestions.length || 1)];

  const handleOptionClick = (option: string) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const correctAns = lang === 'es' ? currentQ.answerEs : lang === 'fr' ? currentQ.answerFr : currentQ.answerEn;

    if (option === correctAns) {
      AudioEngine.playSuccess();
      setScore((prev) => prev + 1);
      setFeedback('correct');
    } else {
      AudioEngine.playError();
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    AudioEngine.playClick();
    const totalQ = gkQuestions.length;

    if (currentRound + 1 < totalQ) {
      setCurrentRound((prev) => prev + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    setGameState('ended');
    AudioEngine.playLevelUp();

    const isPerfect = score === gkQuestions.length;
    let baseStars = score * 12;
    let perfectBonus = isPerfect ? 25 : 0;
    const total = baseStars + perfectBonus;
    setStarsReward(total);

    // GK champion badge on perfect score
    const earnedBadge = isPerfect ? 'gk_champion' : undefined;
    onActivityComplete(total, earnedBadge);
  };

  const restartGame = () => {
    AudioEngine.playClick();
    setGameState('playing');
    setCurrentRound(0);
    setScore(0);
  };

  if (!currentQ) {
    return (
      <div className="text-center p-6 bg-white rounded-2xl border-2 border-slate-900">
        <p className="font-bold">No questions found for this level. Try Medium or Hard!</p>
      </div>
    );
  }

  const getSpeakText = () => {
    return lang === 'es' ? currentQ.questionEs : lang === 'fr' ? currentQ.questionFr : currentQ.questionEn;
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Game Header */}
      <div className="w-full flex justify-between items-center bg-white p-3 border-4 border-slate-900 rounded-2xl shadow">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
          <Globe className="w-5 h-5 text-kid-purple animate-kid-bounce" />
          {t.gk} — {difficulty === 'easy' ? t.easy.split(' ')[0] : difficulty === 'medium' ? t.medium.split(' ')[0] : t.hard.split(' ')[0]}
        </h3>
        <VoiceReader text={getSpeakText()} lang={lang} label="Listen 🔊" />
      </div>

      {gameState === 'playing' ? (
        <div className="cartoon-card p-6 bg-white flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Brainy Quest {currentRound + 1} / {gkQuestions.length}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
              {lang === 'es' ? currentQ.questionEs : lang === 'fr' ? currentQ.questionFr : currentQ.questionEn}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(lang === 'es' ? currentQ.optionsEs : lang === 'fr' ? currentQ.optionsFr : currentQ.optionsEn || []).map((opt) => {
              const isSelected = selectedOption === opt;
              let btnStyle = 'bg-white hover:bg-amber-50 text-slate-800';

              if (isAnswered) {
                const correctAns = lang === 'es' ? currentQ.answerEs : lang === 'fr' ? currentQ.answerFr : currentQ.answerEn;
                if (opt === correctAns) {
                  btnStyle = 'bg-green-400 border-green-600 text-slate-900 font-extrabold';
                } else if (isSelected) {
                  btnStyle = 'bg-red-300 border-red-500 text-slate-900';
                } else {
                  btnStyle = 'bg-slate-50 text-slate-400 opacity-60 border-slate-200 shadow-none';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isAnswered}
                  id={`gk-option-${opt.replace(/\s+/g, '-')}`}
                  className={`cartoon-btn py-4 px-4 text-base font-bold transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Correct/Incorrect Info Card & Fun Fact */}
          {isAnswered && (
            <div className="p-5 rounded-2xl border-4 border-slate-900 bg-[#FFFDF4] flex flex-col gap-3 relative overflow-hidden shadow-[4px_4px_0px_0px_#0f172a]">
              <div className="flex justify-between items-center">
                <span className={`text-lg font-extrabold uppercase ${
                  feedback === 'correct' ? 'text-green-600' : 'text-rose-500'
                }`}>
                  {feedback === 'correct' ? t.correct : t.wrong}
                </span>

                <button
                  onClick={handleNext}
                  id="gk-next-btn"
                  className="cartoon-btn bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-5 py-2 text-xs flex items-center gap-1.5 shrink-0"
                >
                  {t.next} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {currentQ.funFactEn && (
                <div className="pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                    {t.funFact}
                  </h4>
                  <p className="text-sm font-medium text-slate-700 italic mt-1 leading-relaxed">
                    {lang === 'es' ? currentQ.funFactEs : lang === 'fr' ? currentQ.funFactFr : currentQ.funFactEn}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* GK end screen rewards */
        <div className="cartoon-card p-6 bg-white text-center flex flex-col items-center gap-4">
          <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-800">
            {score === gkQuestions.length ? t.perfect : t.greatJob}
          </h2>
          <p className="text-sm font-semibold text-slate-600">
            Fabulous thinking! You scored <span className="text-indigo-600 font-bold text-lg">{score}</span> out of{' '}
            <span className="font-bold text-lg">{gkQuestions.length}</span> quests.
          </p>

          <div className="bg-yellow-400 text-slate-900 border-2 border-slate-900 font-extrabold px-6 py-2 rounded-full flex items-center gap-1.5 text-xl shadow my-2 animate-pulse">
            <Star className="w-6 h-6 fill-slate-900 text-slate-900" />
            +{starsReward} Stars
          </div>

          <button
            onClick={restartGame}
            id="gk-play-again-btn"
            className="cartoon-btn bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold px-8 py-3 text-sm mt-2"
          >
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};
