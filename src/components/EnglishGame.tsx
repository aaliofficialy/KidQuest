import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { Difficulty, Language } from '../types/game';
import { TRANSLATIONS, QUIZ_QUESTIONS } from '../data/questions';
import { VoiceReader } from './VoiceReader';

interface EnglishGameProps {
  difficulty: Difficulty;
  lang: Language;
  onActivityComplete: (starsEarned: number, badgeId?: string) => void;
}

interface SpellingWord {
  word: string;
  emoji: string;
  clueEs: string;
  clueFr: string;
}

const SPELLING_WORDS: Record<'easy' | 'medium', SpellingWord[]> = {
  easy: [
    { word: 'CAT', emoji: '🐱', clueEs: 'Gato', clueFr: 'Chat' },
    { word: 'DOG', emoji: '🐶', clueEs: 'Perro', clueFr: 'Chien' },
    { word: 'FOX', emoji: '🦊', clueEs: 'Zorro', clueFr: 'Renard' },
    { word: 'FROG', emoji: '🐸', clueEs: 'Rana', clueFr: 'Grenouille' },
    { word: 'LION', emoji: '🦁', clueEs: 'León', clueFr: 'Lion' }
  ],
  medium: [
    { word: 'TIGER', emoji: '🐯', clueEs: 'Tigre', clueFr: 'Tigre' },
    { word: 'PANDA', emoji: '🐼', clueEs: 'Panda', clueFr: 'Panda' },
    { word: 'ROCKET', emoji: '🚀', clueEs: 'Cohete', clueFr: 'Fusée' },
    { word: 'APPLE', emoji: '🍎', clueEs: 'Manzana', clueFr: 'Pomme' },
    { word: 'BANANA', emoji: '🍌', clueEs: 'Plátano', clueFr: 'Banane' }
  ]
};

export const EnglishGame: React.FC<EnglishGameProps> = ({ difficulty, lang, onActivityComplete }) => {
  const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [starsReward, setStarsReward] = useState(0);

  // Spelling state
  const [targetWord, setTargetWord] = useState<SpellingWord | null>(null);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number; letter: string; used: boolean }[]>([]);
  const [userSpelling, setUserSpelling] = useState<string[]>([]);
  const [spellingFeedback, setSpellingFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Quiz state for Hard mode
  const englishQuizQuestions = QUIZ_QUESTIONS.filter((q) => q.category === 'english');
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    initRound();
  }, [difficulty, currentRound]);

  const initRound = () => {
    setUserSpelling([]);
    setSpellingFeedback(null);
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);

    if (difficulty === 'easy' || difficulty === 'medium') {
      const words = SPELLING_WORDS[difficulty];
      const wordObj = words[currentRound % words.length];
      setTargetWord(wordObj);

      // Scramble letters
      const letters = wordObj.word.split('').map((char, index) => ({
        id: index,
        letter: char,
        used: false
      }));

      // Shuffle letters
      setScrambledLetters([...letters].sort(() => Math.random() - 0.5));
    }
  };

  const handleLetterClick = (letterObj: { id: number; letter: string; used: boolean }, index: number) => {
    if (letterObj.used || spellingFeedback) return;

    AudioEngine.playClick();

    // Mark letter as used
    const updatedScrambled = [...scrambledLetters];
    updatedScrambled[index].used = true;
    setScrambledLetters(updatedScrambled);

    const newUserSpelling = [...userSpelling, letterObj.letter];
    setUserSpelling(newUserSpelling);

    // Check if spelling is complete
    if (targetWord && newUserSpelling.length === targetWord.word.length) {
      const isCorrect = newUserSpelling.join('') === targetWord.word;
      if (isCorrect) {
        AudioEngine.playSuccess();
        setScore((prev) => prev + 1);
        setSpellingFeedback('correct');
      } else {
        AudioEngine.playError();
        setSpellingFeedback('wrong');
      }
    }
  };

  const resetUserSpelling = () => {
    AudioEngine.playClick();
    setUserSpelling([]);
    setSpellingFeedback(null);
    setScrambledLetters((prev) => prev.map((item) => ({ ...item, used: false })));
  };

  const handleQuizOptionClick = (option: string) => {
    if (isQuizAnswered) return;

    setSelectedQuizOption(option);
    setIsQuizAnswered(true);

    const currentQ = englishQuizQuestions[currentRound % englishQuizQuestions.length];
    const correctAns = lang === 'es' ? currentQ.answerEs : lang === 'fr' ? currentQ.answerFr : currentQ.answerEn;

    if (option === correctAns) {
      AudioEngine.playSuccess();
      setScore((prev) => prev + 1);
    } else {
      AudioEngine.playError();
    }
  };

  const handleNext = () => {
    AudioEngine.playClick();
    const maxRounds = difficulty === 'hard' ? englishQuizQuestions.length : 5;

    if (currentRound + 1 < maxRounds) {
      setCurrentRound((prev) => prev + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    setGameState('ended');
    AudioEngine.playLevelUp();

    const maxRounds = difficulty === 'hard' ? englishQuizQuestions.length : 5;
    const isPerfect = score === maxRounds;

    let baseStars = score * 10;
    let perfectBonus = isPerfect ? 25 : 0;
    const total = baseStars + perfectBonus;
    setStarsReward(total);

    // Earn Word Wizard badge if perfect score
    const earnedBadge = isPerfect ? 'word_wizard' : undefined;
    onActivityComplete(total, earnedBadge);
  };

  const restartGame = () => {
    AudioEngine.playClick();
    setGameState('playing');
    setCurrentRound(0);
    setScore(0);
  };

  const getSpeakText = () => {
    if ((difficulty === 'easy' || difficulty === 'medium') && targetWord) {
      const clue = lang === 'es' ? targetWord.clueEs : lang === 'fr' ? targetWord.clueFr : '';
      return lang === 'es'
        ? `Deletrea la palabra inglesa para ${clue}: ${targetWord.word}`
        : lang === 'fr'
        ? `Épelle le mot anglais pour ${clue} : ${targetWord.word}`
        : `Spell the word for ${targetWord.word}`;
    } else if (difficulty === 'hard') {
      const currentQ = englishQuizQuestions[currentRound % englishQuizQuestions.length];
      return lang === 'es' ? currentQ.questionEs : lang === 'fr' ? currentQ.questionFr : currentQ.questionEn;
    }
    return "";
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Game Header */}
      <div className="w-full flex justify-between items-center bg-white p-3 border-4 border-slate-900 rounded-2xl shadow">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
          <BookOpen className="w-5 h-5 text-kid-blue animate-pulse" />
          {t.english} — {difficulty === 'easy' ? t.easy.split(' ')[0] : difficulty === 'medium' ? t.medium.split(' ')[0] : t.hard.split(' ')[0]}
        </h3>
        <VoiceReader text={getSpeakText()} lang={lang} label="Listen 🔊" />
      </div>

      {gameState === 'playing' ? (
        <div className="cartoon-card p-6 bg-white flex flex-col gap-6">
          {difficulty === 'easy' || difficulty === 'medium' ? (
            /* Interactive Scrambled Letter Game */
            <div className="flex flex-col items-center gap-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Word {currentRound + 1} / 5
              </span>

              {/* Large Cartoon Word Clue */}
              {targetWord && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-6xl sm:text-7xl animate-bounce">{targetWord.emoji}</span>
                  <div className="text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase">
                    Clue: {lang === 'es' ? targetWord.clueEs : lang === 'fr' ? targetWord.clueFr : 'Animal / Item'}
                  </div>
                </div>
              )}

              {/* User spelling field slots */}
              <div className="flex gap-2 min-h-[50px] items-center justify-center">
                {targetWord?.word.split('').map((_, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 sm:w-12 sm:h-12 border-2 border-slate-900 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                      spellingFeedback === 'correct'
                        ? 'bg-green-100 text-green-700'
                        : spellingFeedback === 'wrong'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-50 text-slate-800'
                    }`}
                  >
                    {userSpelling[i] || ''}
                  </div>
                ))}
              </div>

              {/* Scrambled Bubble letters to click */}
              <div className="flex flex-wrap gap-3 justify-center my-2">
                {scrambledLetters.map((letterObj, idx) => (
                  <button
                    key={letterObj.id}
                    onClick={() => handleLetterClick(letterObj, idx)}
                    disabled={letterObj.used || !!spellingFeedback}
                    id={`scramble-letter-${idx}`}
                    className={`w-12 h-12 rounded-full border-3 border-slate-900 text-xl font-bold font-display shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-transform ${
                      letterObj.used
                        ? 'bg-slate-100 text-slate-300 opacity-45 transform translate-y-0.5 shadow-none'
                        : 'bg-kid-yellow text-slate-900 hover:scale-105 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {letterObj.letter}
                  </button>
                ))}
              </div>

              {/* Reset or Answer feedback blocks */}
              {spellingFeedback ? (
                <div className={`w-full p-4 rounded-xl border-2 flex justify-between items-center ${
                  spellingFeedback === 'correct' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'
                }`}>
                  <span className="font-bold">
                    {spellingFeedback === 'correct' ? t.correct : `${t.wrong} (${targetWord?.word})`}
                  </span>

                  <button
                    onClick={handleNext}
                    id="english-next-btn-spelling"
                    className="cartoon-btn bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-4 py-2 text-xs flex items-center gap-1"
                  >
                    {t.next} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                userSpelling.length > 0 && (
                  <button
                    onClick={resetUserSpelling}
                    id="reset-spelling-btn"
                    className="cartoon-btn bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-4 py-2 text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Start Over
                  </button>
                )
              )}
            </div>
          ) : (
            /* HARD Mode Quiz */
            <div className="flex flex-col gap-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t.questions} {currentRound + 1} / {englishQuizQuestions.length}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                {lang === 'es'
                  ? englishQuizQuestions[currentRound % englishQuizQuestions.length].questionEs
                  : lang === 'fr'
                  ? englishQuizQuestions[currentRound % englishQuizQuestions.length].questionFr
                  : englishQuizQuestions[currentRound % englishQuizQuestions.length].questionEn}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {(lang === 'es'
                  ? englishQuizQuestions[currentRound % englishQuizQuestions.length].optionsEs
                  : lang === 'fr'
                  ? englishQuizQuestions[currentRound % englishQuizQuestions.length].optionsFr
                  : englishQuizQuestions[currentRound % englishQuizQuestions.length].optionsEn || []
                ).map((opt) => {
                  const isSelected = selectedQuizOption === opt;
                  let btnStyle = 'bg-white hover:bg-slate-50 text-slate-800';

                  if (isQuizAnswered) {
                    const correctAns = lang === 'es'
                      ? englishQuizQuestions[currentRound % englishQuizQuestions.length].answerEs
                      : lang === 'fr'
                      ? englishQuizQuestions[currentRound % englishQuizQuestions.length].answerFr
                      : englishQuizQuestions[currentRound % englishQuizQuestions.length].answerEn;

                    if (opt === correctAns) {
                      btnStyle = 'bg-green-400 border-green-600 text-slate-900';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-300 border-red-500 text-slate-900';
                    } else {
                      btnStyle = 'bg-white text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleQuizOptionClick(opt)}
                      disabled={isQuizAnswered}
                      id={`english-quiz-option-${opt}`}
                      className={`cartoon-btn py-3 sm:py-4 px-4 text-base font-bold ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isQuizAnswered && (
                <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl flex justify-between items-center">
                  <p className="text-xs font-medium text-slate-600 italic">
                    ✨ {t.funFact}: {
                      lang === 'es'
                        ? englishQuizQuestions[currentRound % englishQuizQuestions.length].funFactEs
                        : lang === 'fr'
                        ? englishQuizQuestions[currentRound % englishQuizQuestions.length].funFactFr
                        : englishQuizQuestions[currentRound % englishQuizQuestions.length].funFactEn
                    }
                  </p>

                  <button
                    onClick={handleNext}
                    id="english-next-btn-quiz"
                    className="cartoon-btn bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-4 py-2 text-xs flex items-center gap-1 shrink-0 ml-4"
                  >
                    {t.next} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* End of Word Castle game rewards */
        <div className="cartoon-card p-6 bg-white text-center flex flex-col items-center gap-4">
          <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-800">
            {score === (difficulty === 'hard' ? englishQuizQuestions.length : 5) ? t.perfect : t.greatJob}
          </h2>
          <p className="text-sm font-semibold text-slate-600">
            Spelling master! You scored <span className="text-indigo-600 font-bold text-lg">{score}</span> out of{' '}
            <span className="font-bold text-lg">{difficulty === 'hard' ? englishQuizQuestions.length : 5}</span> spelling questions.
          </p>

          <div className="bg-yellow-400 text-slate-900 border-2 border-slate-900 font-extrabold px-6 py-2 rounded-full flex items-center gap-1.5 text-xl shadow my-2 animate-pulse">
            <Star className="w-6 h-6 fill-slate-900 text-slate-900" />
            +{starsReward} Stars
          </div>

          <button
            onClick={restartGame}
            id="english-play-again-btn"
            className="cartoon-btn bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold px-8 py-3 text-sm mt-2"
          >
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};
