import React from 'react';
import { Trophy, Star, ShieldAlert } from 'lucide-react';
import { Profile } from '../types/game';
import { TRANSLATIONS } from '../data/questions';
import { AVATARS } from './AvatarSelector';

interface LeaderboardProps {
  profiles: Profile[];
  lang: 'en' | 'es' | 'fr';
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ profiles, lang }) => {
  const t = TRANSLATIONS[lang];

  // Sort profiles by stars descending
  const sorted = [...profiles].sort((a, b) => b.stars - a.stars);

  const getAvatarEmoji = (key: string) => {
    return AVATARS.find((av) => av.key === key)?.emoji || '👶';
  };

  return (
    <div className="cartoon-card p-6 bg-white max-w-md mx-auto">
      <div className="text-center mb-6">
        <Trophy className="w-12 h-12 text-yellow-500 mx-auto animate-bounce mb-1" />
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
          {t.leaderboard}
        </h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Who has the most stars?
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center p-4 text-slate-400">
          <p className="text-sm font-semibold">{t.noProfiles}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((p, index) => {
            let rankEmoji = '⭐';
            let rankBg = 'bg-slate-50 border-slate-200';

            if (index === 0) {
              rankEmoji = '🥇';
              rankBg = 'bg-yellow-100 border-yellow-300';
            } else if (index === 1) {
              rankEmoji = '🥈';
              rankBg = 'bg-slate-100 border-slate-300';
            } else if (index === 2) {
              rankEmoji = '🥉';
              rankBg = 'bg-orange-100 border-orange-200';
            }

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 border-2 border-slate-900 rounded-xl transition-transform hover:scale-[1.02] ${rankBg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center font-bold">
                    {index < 3 ? rankEmoji : `#${index + 1}`}
                  </span>

                  <span className="text-3xl filter drop-shadow">
                    {getAvatarEmoji(p.avatar)}
                  </span>

                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm sm:text-base">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {t.age}: {p.age} | {p.level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white px-3 py-1 border border-slate-900 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                  <span className="font-mono font-extrabold text-slate-800 text-sm sm:text-base">
                    {p.stars}
                  </span>
                </div>
              </div>
            );
          })}

          {sorted.length === 1 && (
            <div className="mt-4 p-3 bg-indigo-50 border border-dashed border-indigo-200 rounded-xl text-center text-xs text-indigo-700 font-medium">
              💡 Parents: Create profiles for multiple children (siblings or friends) to start a friendly learning quest competition!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
