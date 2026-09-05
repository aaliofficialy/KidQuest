import React from 'react';
import { Sparkles, Star, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { TRANSLATIONS } from '../data/questions';

interface DailyChallengeProps {
  lang: 'en' | 'es' | 'fr';
  activeProfileStars: number;
  completedToday: boolean;
  onSelectCategory: (category: string) => void;
}

const CHALLENGES = [
  {
    day: 0, // Sunday
    category: 'math',
    descEn: 'Solve 4 Math counting challenges today!',
    descEs: '¡Resuelve 4 desafíos de conteo matemático hoy!',
    descFr: 'Résous 4 défis de calcul aujourd’hui !',
    bonus: 25
  },
  {
    day: 1, // Monday
    category: 'english',
    descEn: 'Spell 5 word puzzles in the Word Castle!',
    descEs: '¡Deletrea 5 palabras en el Castillo de Palabras!',
    descFr: 'Épelle 5 mots dans le Château des Mots !',
    bonus: 25
  },
  {
    day: 2, // Tuesday
    category: 'science',
    descEn: 'Explore Space Lab science quizzes!',
    descEs: '¡Explora cuestionarios en el Laboratorio Espacial!',
    descFr: 'Explore les quiz dans le Labo de l’Espace !',
    bonus: 25
  },
  {
    day: 3, // Wednesday
    category: 'gk',
    descEn: 'Answer Brain Quest General Knowledge quizzes!',
    descEs: '¡Responde preguntas de cultura general!',
    descFr: 'Réponds au quiz de culture générale !',
    bonus: 25
  },
  {
    day: 4, // Thursday
    category: 'memory',
    descEn: 'Clear any Memory Matching card game!',
    descEs: '¡Completa cualquier juego de cartas de memoria!',
    descFr: 'Réussis un jeu de cartes mémoire !',
    bonus: 25
  },
  {
    day: 5, // Friday
    category: 'drawing',
    descEn: 'Create a colorful drawing in the Art Studio!',
    descEs: '¡Crea un dibujo colorido en el Estudio de Arte!',
    descFr: 'Crée un dessin coloré dans l’Atelier d’Art !',
    bonus: 25
  },
  {
    day: 6, // Saturday
    category: 'puzzle',
    descEn: 'Complete a shape recognition Logic Puzzle!',
    descEs: '¡Completa un acertijo lógico de formas!',
    descFr: 'Complète un défi de logique et de formes !',
    bonus: 25
  }
];

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  lang,
  completedToday,
  onSelectCategory
}) => {
  const currentDay = new Date().getDay(); // 0 - 6
  const challenge = CHALLENGES.find((c) => c.day === currentDay) || CHALLENGES[0];
  const t = TRANSLATIONS[lang];

  const getDesc = () => {
    return lang === 'es' ? challenge.descEs : lang === 'fr' ? challenge.descFr : challenge.descEn;
  };

  const handleStartChallenge = () => {
    AudioEngine.playClick();
    onSelectCategory(challenge.category);
  };

  return (
    <div className="cartoon-card p-6 bg-[#FFF5EE] border-b-[10px] border-[#FFD39B] rounded-[32px] max-w-md mx-auto shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-8 h-8 text-indigo-500 animate-pulse" />
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {t.dailyChallenge}
          </h3>
          <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block">
            TODAY'S SPECIAL QUEST
          </span>
        </div>
      </div>

      <div className="bg-white border-2 border-[#FFD39B]/30 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm sm:text-base font-bold text-slate-700 leading-snug">
            {getDesc()}
          </p>
          <Sparkles className="w-5 h-5 text-yellow-500 shrink-0 ml-2 animate-bounce" />
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">REWARD:</span>
            <div className="bg-amber-400 text-white px-3 py-1 rounded-full font-black text-xs flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-white text-white" />
              +{challenge.bonus} Stars
            </div>
          </div>

          {completedToday ? (
            <div className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
              <CheckCircle2 className="w-4 h-4 fill-green-100" />
              Done!
            </div>
          ) : (
            <button
              onClick={handleStartChallenge}
              id="start-daily-challenge-btn"
              className="cartoon-btn bg-amber-400 hover:bg-amber-500 text-white font-black text-xs py-1.5 px-4 flex items-center gap-1 shadow-sm"
            >
              Play <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
