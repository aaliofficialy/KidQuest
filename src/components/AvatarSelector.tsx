import React from 'react';

export const AVATARS = [
  { key: 'fox', emoji: '🦊', name: 'Felix the Fox', bg: 'bg-orange-100 border-orange-300' },
  { key: 'panda', emoji: '🐼', name: 'Pippa Panda', bg: 'bg-slate-100 border-slate-300' },
  { key: 'lion', emoji: '🦁', name: 'Leo the Lion', bg: 'bg-amber-100 border-amber-300' },
  { key: 'frog', emoji: '🐸', name: 'Fred the Frog', bg: 'bg-emerald-100 border-emerald-300' },
  { key: 'koala', emoji: '🐨', name: 'Kiki Koala', bg: 'bg-sky-100 border-sky-300' },
  { key: 'unicorn', emoji: '🦄', name: 'Una Unicorn', bg: 'bg-pink-100 border-pink-300' },
  { key: 'dino', emoji: '🦖', name: 'Rex the Dino', bg: 'bg-green-100 border-green-300' },
  { key: 'owl', emoji: '🦉', name: 'Ollie the Owl', bg: 'bg-purple-100 border-purple-300' }
];

interface AvatarSelectorProps {
  selectedKey: string;
  onSelect: (key: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedKey, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATARS.map((av) => {
        const isSelected = selectedKey === av.key;
        return (
          <button
            key={av.key}
            type="button"
            onClick={() => onSelect(av.key)}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
              av.bg
            } ${
              isSelected 
                ? 'scale-110 border-slate-900 ring-4 ring-yellow-400' 
                : 'border-transparent opacity-75 hover:opacity-100'
            }`}
          >
            <span className="text-3xl sm:text-4xl animate-pulse">{av.emoji}</span>
            <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-full">
              {av.name.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
