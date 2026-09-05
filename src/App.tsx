import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, BookOpen, FlaskConical, Globe, Brain, Palette, HelpCircle, 
  Trophy, Star, Calendar, UserPlus, LogOut, Shield, Wifi, WifiOff, Languages,
  Home, RefreshCw, Zap, Info, Play, Settings
} from 'lucide-react';

import { Profile, Difficulty, Language, QuizQuestion } from './types/game';
import { BADGES, TRANSLATIONS, QUIZ_QUESTIONS } from './data/questions';
import { AudioEngine } from './components/AudioEngine';
import { AvatarSelector, AVATARS } from './components/AvatarSelector';
import { DrawingCanvas } from './components/DrawingCanvas';
import { MemoryGame } from './components/MemoryGame';
import { MathGame } from './components/MathGame';
import { EnglishGame } from './components/EnglishGame';
import { ScienceGame } from './components/ScienceGame';
import { GKGame } from './components/GKGame';
import { LogicPuzzle } from './components/LogicPuzzle';
import { ParentDashboard } from './components/ParentDashboard';
import { Leaderboard } from './components/Leaderboard';
import { DailyChallenge } from './components/DailyChallenge';
import { AdBanner } from './components/AdBanner';
import { Confetti } from './components/Confetti';

// Base initial profile if storage empty
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'kid_1',
    name: 'Joy',
    avatar: 'unicorn',
    age: 7,
    level: 'easy',
    levelNumber: 1,
    highestUnlockedLevel: 1,
    totalXP: 0,
    totalCoins: 0,
    totalStars: 35,
    dailyStreak: 0,
    lastLogin: new Date().toISOString().split('T')[0],
    completedLessons: ['memory-easy'],
    badges: ['memory_master'],
    history: [
      { id: 'hist_1', category: 'memory', score: 4, totalQuestions: 4, difficulty: 'easy', date: '2026-06-30' }
    ]
  },
  {
    id: 'kid_2',
    name: 'Leo',
    avatar: 'lion',
    age: 9,
    level: 'medium',
    levelNumber: 21,
    highestUnlockedLevel: 21,
    totalXP: 500,
    totalCoins: 100,
    totalStars: 120,
    dailyStreak: 3,
    lastLogin: new Date().toISOString().split('T')[0],
    completedLessons: ['math_genius', 'science_explorer'],
    badges: ['math_genius', 'science_explorer', 'star_collector'],
    history: [
      { id: 'hist_2', category: 'math', score: 4, totalQuestions: 4, difficulty: 'medium', date: '2026-06-29' },
      { id: 'hist_3', category: 'science', score: 3, totalQuestions: 3, difficulty: 'medium', date: '2026-06-30' }
    ]
  }
];

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [offlineMode, setOfflineMode] = useState(false);
  const [currentView, setCurrentView] = useState<'profile-select' | 'dashboard' | 'game' | 'parent' | 'leaderboard' | 'daily'>('profile-select');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // New Profile Form
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(7);
  const [newProfileAvatar, setNewProfileAvatar] = useState('fox');
  const [newProfileDifficulty, setNewProfileDifficulty] = useState<Difficulty>('easy');

  // Custom quiz questions (written by parents)
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[]>([]);

  // Daily Challenge state
  const [dailyCompletedToday, setDailyCompletedToday] = useState(false);

  // Confetti celebration state
  const [confettiActive, setConfettiActive] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Load and setup localStorage state
  useEffect(() => {
    // Profiles
    const stored = localStorage.getItem('kidquest_profiles');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfiles(parsed);
      } catch (e) {
        setProfiles(DEFAULT_PROFILES);
      }
    } else {
      setProfiles(DEFAULT_PROFILES);
      localStorage.setItem('kidquest_profiles', JSON.stringify(DEFAULT_PROFILES));
    }

    // Custom questions
    const storedQ = localStorage.getItem('kidquest_custom_questions');
    if (storedQ) {
      try {
        setCustomQuestions(JSON.parse(storedQ));
      } catch (e) {}
    }

    // Load active profile if any was selected
    const activeId = localStorage.getItem('kidquest_active_id');
    if (activeId) {
      const found = profiles.find(p => p.id === activeId);
      if (found) setActiveProfile(found);
    }

    // Load language preference
    const storedLang = localStorage.getItem('kidquest_lang');
    if (storedLang && (storedLang === 'en' || storedLang === 'es' || storedLang === 'fr')) {
      setLang(storedLang);
    }
  }, []);

  // Sync profiles back to local storage
  const saveProfiles = (updated: Profile[]) => {
    setProfiles(updated);
    localStorage.setItem('kidquest_profiles', JSON.stringify(updated));
  };

  // Profile creation
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    AudioEngine.playSuccess();

    const newProf: Profile = {
      id: 'kid_' + Date.now(),
      name: newProfileName,
      avatar: newProfileAvatar,
      age: Number(newProfileAge),
      level: newProfileDifficulty,
      levelNumber: 1,
      highestUnlockedLevel: 1,
      totalXP: 0,
      totalCoins: 0,
      totalStars: 0,
      dailyStreak: 0,
      lastLogin: new Date().toISOString().split('T')[0],
      completedLessons: [],
      badges: [],
      history: []
    };

    const updated = [...profiles, newProf];
    saveProfiles(updated);
    setActiveProfile(newProf);
    localStorage.setItem('kidquest_active_id', newProf.id);

    // Reset form
    setNewProfileName('');
    setNewProfileAge(7);
    setCurrentView('dashboard');
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    saveProfiles(updated);
    if (activeProfile?.id === id) {
      setActiveProfile(null);
      localStorage.removeItem('kidquest_active_id');
      setCurrentView('profile-select');
    }
  };

  const handleSelectProfile = (p: Profile) => {
    AudioEngine.playClick();
    setActiveProfile(p);
    localStorage.setItem('kidquest_active_id', p.id);
    setCurrentView('dashboard');
  };

  const handleLogoutProfile = () => {
    AudioEngine.playClick();
    setActiveProfile(null);
    localStorage.removeItem('kidquest_active_id');
    setCurrentView('profile-select');
  };

  // Language switch
  const changeLanguage = (newLang: Language) => {
    AudioEngine.playClick();
    setLang(newLang);
    localStorage.setItem('kidquest_lang', newLang);
  };

  // Add custom parental questions
  const handleAddCustomQuestion = (newQ: QuizQuestion) => {
    const updated = [newQ, ...customQuestions];
    setCustomQuestions(updated);
    localStorage.setItem('kidquest_custom_questions', JSON.stringify(updated));

    // Dynamic merge into static pool
    QUIZ_QUESTIONS.unshift(newQ);
  };

  const handleDeleteCustomQuestion = (id: string) => {
    const updated = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(updated);
    localStorage.setItem('kidquest_custom_questions', JSON.stringify(updated));

    // Remove from active runtime QUIZ_QUESTIONS
    const idx = QUIZ_QUESTIONS.findIndex(q => q.id === id);
    if (idx > -1) {
      QUIZ_QUESTIONS.splice(idx, 1);
    }
  };

  // Activity Completion Rewards Manager
  const handleActivityComplete = (data: ActivityCompletionData) => {
    if (!activeProfile) return;

    AudioEngine.playSuccess();
    setConfettiActive(true);

    let updatedBadges = [...activeProfile.badges];
    let badgeNotificationText: string | null = null;

    // Check custom badge reward triggered by specific game completion
    if (data.badgeId && !updatedBadges.includes(data.badgeId)) {
      updatedBadges.push(data.badgeId);
      const badgeObj = BADGES.find(b => b.id === data.badgeId);
      if (badgeObj) {
        badgeNotificationText = lang === 'es' ? badgeObj.nameEs : lang === 'fr' ? badgeObj.nameFr : badgeObj.nameEn;
      }
    }

    // Check Star collector badge trigger (accumulating over 100 stars)
    const newStarsCount = activeProfile.totalStars + data.starsEarned;
    if (newStarsCount >= 100 && !updatedBadges.includes('star_collector')) {
      updatedBadges.push('star_collector');
      badgeNotificationText = "Super Star ⭐";
    }

    // Create history event record
    const historyItem = {
      id: 'hist_' + Date.now(),
      category: data.category,
      score: data.accuracy > 70 ? 4 : 3, // mock scoring ratio
      totalQuestions: 4,
      difficulty: activeProfile.level,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Calculate new level
    let newLevelNumber = activeProfile.levelNumber;
    let newHighestUnlockedLevel = activeProfile.highestUnlockedLevel;
    
    // Only unlock next level if passed level and it's the current one
    if (data.accuracy >= 70 && newLevelNumber === newHighestUnlockedLevel) {
        newLevelNumber += 1;
        newHighestUnlockedLevel += 1;
    } else if (data.accuracy >= 70) {
        newLevelNumber += 1;
    }

    const updatedProfile: Profile = {
      ...activeProfile,
      totalStars: newStarsCount,
      totalXP: activeProfile.totalXP + data.xpEarned,
      totalCoins: activeProfile.totalCoins + data.coinsEarned,
      levelNumber: newLevelNumber,
      highestUnlockedLevel: newHighestUnlockedLevel,
      badges: updatedBadges,
      history: [historyItem, ...activeProfile.history]
    };

    // Update state & persist
    setActiveProfile(updatedProfile);
    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    saveProfiles(updatedProfiles);

    if (badgeNotificationText) {
      setAchievementNotification(badgeNotificationText);
      setTimeout(() => {
        setAchievementNotification(null);
      }, 5000);
    }

    setTimeout(() => {
      setConfettiActive(false);
    }, 4000);
  };

  const getProfileAvatarEmoji = (key: string) => {
    return AVATARS.find(a => a.key === key)?.emoji || '👶';
  };

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case 'math':
        return {
          name: t.math,
          icon: Calculator,
          desc: 'Fun Counting, Addition & Multiplication!',
          cardBg: 'bg-[#FFE4E1]',
          cardBorder: 'border-b-[12px] border-[#FFB6C1]',
          textClass: 'text-[#D02090]',
          subTextClass: 'text-[#FF69B4]',
          iconBg: 'bg-white',
          iconColor: 'text-[#D02090]',
          btnClass: 'bg-[#FFB6C1]/30 hover:bg-[#FFB6C1]/50 text-[#D02090] border-[#FFB6C1]'
        };
      case 'english':
        return {
          name: t.english,
          icon: BookOpen,
          desc: 'Spelling Bees, Letters & Grammar fun!',
          cardBg: 'bg-[#E0FFFF]',
          cardBorder: 'border-b-[12px] border-[#AFEEEE]',
          textClass: 'text-teal-700',
          subTextClass: 'text-teal-500',
          iconBg: 'bg-white',
          iconColor: 'text-teal-700',
          btnClass: 'bg-[#AFEEEE]/30 hover:bg-[#AFEEEE]/50 text-teal-700 border-[#AFEEEE]'
        };
      case 'science':
        return {
          name: t.science,
          icon: FlaskConical,
          desc: 'Learn Planets, States of Matter & Stars!',
          cardBg: 'bg-[#F0FFF0]',
          cardBorder: 'border-b-[12px] border-[#98FB98]',
          textClass: 'text-emerald-800',
          subTextClass: 'text-emerald-600',
          iconBg: 'bg-white',
          iconColor: 'text-emerald-800',
          btnClass: 'bg-[#98FB98]/30 hover:bg-[#98FB98]/50 text-emerald-800 border-[#98FB98]'
        };
      case 'gk':
        return {
          name: t.gk,
          icon: Globe,
          desc: 'Explore Countries, Animals & Fun Facts!',
          cardBg: 'bg-[#FDF5E6]',
          cardBorder: 'border-b-[12px] border-[#FFE4B5]',
          textClass: 'text-orange-800',
          subTextClass: 'text-orange-600',
          iconBg: 'bg-white',
          iconColor: 'text-orange-800',
          btnClass: 'bg-[#FFE4B5]/30 hover:bg-[#FFE4B5]/50 text-orange-800 border-[#FFE4B5]'
        };
      case 'memory':
        return {
          name: t.memory,
          icon: Brain,
          desc: "Train your brain with animal matching cards!",
          cardBg: 'bg-[#FFF5EE]',
          cardBorder: 'border-b-[12px] border-[#FFD39B]',
          textClass: 'text-amber-950',
          subTextClass: 'text-amber-800',
          iconBg: 'bg-white',
          iconColor: 'text-amber-950',
          btnClass: 'bg-[#FFD39B]/30 hover:bg-[#FFD39B]/50 text-amber-950 border-[#FFD39B]'
        };
      case 'puzzle':
        return {
          name: t.puzzle,
          icon: HelpCircle,
          desc: 'Solve colors, visual patterns & riddles!',
          cardBg: 'bg-[#FFFACD]',
          cardBorder: 'border-b-[12px] border-[#F0E68C]',
          textClass: 'text-amber-800',
          subTextClass: 'text-amber-600',
          iconBg: 'bg-white',
          iconColor: 'text-amber-800',
          btnClass: 'bg-[#F0E68C]/30 hover:bg-[#F0E68C]/50 text-amber-800 border-[#F0E68C]'
        };
      default:
        return {
          name: t.drawing,
          icon: Palette,
          desc: 'Art studio paint pad for kids!',
          cardBg: 'bg-[#E6E6FA]',
          cardBorder: 'border-b-[12px] border-[#D8BFD8]',
          textClass: 'text-indigo-800',
          subTextClass: 'text-indigo-600',
          iconBg: 'bg-white',
          iconColor: 'text-indigo-800',
          btnClass: 'bg-[#D8BFD8]/30 hover:bg-[#D8BFD8]/50 text-indigo-800 border-[#D8BFD8]'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] font-sans pb-12 select-none relative text-slate-800">
      <Confetti active={confettiActive} />

      {/* Dynamic Animated Achievement Badge Popup Drawer */}
      <AnimatePresence>
        {achievementNotification && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.8 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-300 to-amber-300 border-b-8 border-amber-500 rounded-3xl py-3 px-6 shadow-xl text-center min-w-[280px]"
          >
            <span className="text-2xl animate-bounce block mb-1">🏆🎉</span>
            <h4 className="font-extrabold text-slate-900 text-base">{t.badgeEarned}</h4>
            <p className="text-sm font-bold text-amber-900">{achievementNotification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Navigation Header */}
      <header className="bg-white/85 border-b-4 border-blue-100 backdrop-blur-sm py-3.5 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={() => {
              AudioEngine.playClick();
              if (activeProfile) {
                setCurrentView('dashboard');
                setActiveCategory(null);
              } else {
                setCurrentView('profile-select');
              }
            }}
            id="logo-brand-btn"
            className="flex items-center gap-2 text-left cursor-pointer hover:scale-102 transition-transform"
          >
            <div className="bg-amber-400 p-1.5 rounded-xl text-white shadow-sm animate-kid-bounce">
              <Star className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-slate-700 text-xl tracking-tight leading-none">
                {t.appName}
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                Fun Interactive Learning
              </span>
            </div>
          </button>

          {/* Quick Language & Settings Panel */}
          <div className="flex items-center gap-2">
            
            {/* Safe Offline Mode Badge */}
            <button
              onClick={() => {
                AudioEngine.playClick();
                setOfflineMode(!offlineMode);
              }}
              id="offline-safe-mode-toggle"
              className={`p-2 rounded-xl border-2 border-blue-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                offlineMode 
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              title={t.offlineMode}
            >
              {offlineMode ? <WifiOff className="w-4 h-4 text-rose-500 animate-pulse" /> : <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />}
              <span className="hidden sm:inline">{offlineMode ? "Offline Active" : "Online Safe"}</span>
            </button>

            {/* Language Selection Buttons */}
            <div className="flex gap-1 bg-slate-50 p-1 border-2 border-blue-100 rounded-xl">
              <button
                onClick={() => changeLanguage('en')}
                id="lang-en-btn"
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  lang === 'en' ? 'bg-indigo-400 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => changeLanguage('es')}
                id="lang-es-btn"
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  lang === 'es' ? 'bg-indigo-400 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                🇪🇸 ES
              </button>
              <button
                onClick={() => changeLanguage('fr')}
                id="lang-fr-btn"
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  lang === 'fr' ? 'bg-indigo-400 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                🇫🇷 FR
              </button>
            </div>

            {/* Admin parents lock entry */}
            <button
              onClick={() => {
                AudioEngine.playClick();
                setCurrentView('parent');
              }}
              id="admin-dashboard-entry"
              className="p-2 border-2 border-blue-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-sm"
              title="Parent Dashboard"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        
        {/* VIEW 1: PROFILE SELECTION & CREATION SCREEN */}
        {currentView === 'profile-select' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-4 items-start">
            
            {/* Selector Grid of current kids */}
            <div className="cartoon-card p-6 bg-white md:col-span-3">
              <h2 className="text-xl font-bold text-slate-800 text-center mb-6 animate-wiggle">
                {t.selectProfile}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProfile(p)}
                    id={`profile-card-${p.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl border-3 border-slate-900 bg-amber-50/30 hover:bg-amber-100/40 text-left cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                  >
                    <span className="text-5xl filter drop-shadow animate-kid-bounce">
                      {getProfileAvatarEmoji(p.avatar)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-lg truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {t.age} {p.age} | {p.level}
                      </p>
                      
                      <div className="flex items-center gap-1 mt-1 bg-white border border-slate-900 rounded-full px-2 py-0.5 w-fit">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                        <span className="font-mono font-extrabold text-slate-700 text-xs">
                          {p.stars}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {profiles.length === 0 && (
                <div className="text-center py-6">
                  <span className="text-5xl block mb-2 animate-bounce">🎈🦄</span>
                  <p className="text-sm font-semibold text-slate-500">{t.noProfiles}</p>
                </div>
              )}
            </div>

            {/* Creation module */}
            <div className="cartoon-card p-6 bg-gradient-to-b from-[#FFFDF4] to-[#FFF9E6] md:col-span-2">
              <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-indigo-500" /> {t.createProfile}
              </h3>

              <form onSubmit={handleCreateProfile} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1">
                    What is your name?
                  </label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    id="new-profile-name"
                    required
                    maxLength={10}
                    placeholder={t.enterName}
                    className="w-full bg-white border-3 border-slate-900 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1">
                      {t.age} (Years)
                    </label>
                    <input
                      type="number"
                      value={newProfileAge}
                      onChange={(e) => setNewProfileAge(Math.max(5, Math.min(12, Number(e.target.value))))}
                      id="new-profile-age"
                      required
                      min={5}
                      max={12}
                      className="w-full bg-white border-3 border-slate-900 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1">
                      Level
                    </label>
                    <select
                      value={newProfileDifficulty}
                      onChange={(e) => setNewProfileDifficulty(e.target.value as Difficulty)}
                      id="new-profile-difficulty"
                      className="w-full bg-white border-3 border-slate-900 rounded-xl px-2 py-2 font-bold text-slate-800 outline-none"
                    >
                      <option value="easy">Easy (5-7)</option>
                      <option value="medium">Medium (8-10)</option>
                      <option value="hard">Hard (11-12)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase mb-1.5">
                    {t.chooseAvatar}
                  </label>
                  <AvatarSelector selectedKey={newProfileAvatar} onSelect={setNewProfileAvatar} />
                </div>

                <button
                  type="submit"
                  id="create-profile-submit-btn"
                  className="cartoon-btn bg-emerald-400 text-slate-900 font-bold py-3 mt-2 text-sm uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-slate-900" />
                  {t.start}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE CHILD CENTRAL DASHBOARD */}
        {currentView === 'dashboard' && activeProfile && (
          <div className="flex flex-col gap-6 py-2">
            
            {/* Kid Mascot Banner Card */}
            <div className="cartoon-card p-4 bg-gradient-to-r from-sky-100 to-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-6xl animate-kid-bounce filter drop-shadow-md">
                  {getProfileAvatarEmoji(activeProfile.avatar)}
                </span>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1">
                    Hello, {activeProfile.name}!
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Level: <span className="text-indigo-600 font-extrabold">{activeProfile.level.toUpperCase()}</span> | Age: {activeProfile.age}
                  </p>
                </div>
              </div>

              {/* Stars & Daily counter badges */}
              <div className="flex items-center gap-2">
                <div className="bg-yellow-300 text-slate-900 border-3 border-slate-900 font-extrabold px-4 py-2 rounded-2xl flex items-center gap-1.5 text-base shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] animate-pulse">
                  <Star className="w-5 h-5 fill-slate-900 text-slate-900 animate-spin-slow" />
                  <span>{activeProfile.stars} Stars</span>
                </div>

                <button
                  onClick={handleLogoutProfile}
                  id="logout-profile-btn"
                  className="cartoon-btn bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 flex items-center gap-1 text-xs font-bold"
                  title="Switch profile"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.backToProfiles}</span>
                </button>
              </div>
            </div>

            {/* Quick action widgets drawer: Leaderboard and Daily Challenge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              <DailyChallenge
                lang={lang}
                activeProfileStars={activeProfile.stars}
                completedToday={dailyCompletedToday}
                onSelectCategory={(cat) => {
                  setActiveCategory(cat);
                  setCurrentView('game');
                }}
              />

              {/* Awarded Badges shelf visual cabinet */}
              <div className="cartoon-card p-5 bg-white">
                <h4 className="font-extrabold text-slate-800 text-sm sm:text-base mb-3 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" />
                  My Trophy Shelf ({activeProfile.badges.length})
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {BADGES.map((badge) => {
                    const isEarned = activeProfile.badges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold flex items-center gap-1 transition-opacity ${
                          isEarned 
                            ? `${badge.color} scale-100` 
                            : 'bg-slate-100 text-slate-300 border-slate-200 opacity-40'
                        }`}
                        title={lang === 'es' ? badge.descriptionEs : lang === 'fr' ? badge.descriptionFr : badge.descriptionEn}
                      >
                        <span>{lang === 'es' ? badge.nameEs : lang === 'fr' ? badge.nameFr : badge.nameEn}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interactive Section Subjects grid list */}
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                Pick a learning Land!
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {['math', 'english', 'science', 'gk', 'memory', 'puzzle', 'drawing'].map((cat) => {
                  const details = getCategoryDetails(cat);
                  const CatIcon = details.icon;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        AudioEngine.playClick();
                        setActiveCategory(cat);
                        setCurrentView('game');
                      }}
                      id={`land-card-${cat}`}
                      className={`p-6 flex flex-col text-center justify-between items-center gap-4 rounded-[45px] hover:scale-103 transition-transform cursor-pointer shadow-lg hover:shadow-xl ${details.cardBg} ${details.cardBorder}`}
                    >
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner animate-kid-bounce ${details.iconBg} ${details.iconColor}`}>
                        <CatIcon className="w-9 h-9" />
                      </div>

                      <div>
                        <h4 className={`text-xl font-black ${details.textClass}`}>
                          {details.name}
                        </h4>
                        <p className={`text-xs font-bold mt-1.5 ${details.subTextClass}`}>
                          {details.desc}
                        </p>
                      </div>

                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase border shadow-sm ${details.btnClass || 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                        Let's Go!
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Hall of Fame leaderboard drawer */}
            <div className="pt-4 border-t-2 border-slate-100">
              <Leaderboard profiles={profiles} lang={lang} />
            </div>
          </div>
        )}

        {/* VIEW 3: EDUCATION GAME RUNTIME DISPLAY SCREEN */}
        {currentView === 'game' && activeProfile && activeCategory && (
          <div className="flex flex-col gap-4">
            
            {/* Top Back navigation bar */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  AudioEngine.playClick();
                  setCurrentView('dashboard');
                  setActiveCategory(null);
                }}
                id="back-to-lands-btn"
                className="cartoon-btn bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Back to Lands
              </button>

              {/* Quick profile tracker on games page */}
              <div className="flex items-center gap-2 bg-indigo-50 border-2 border-slate-900 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700">
                <span>{t.activeProfile}: <span className="text-indigo-600 font-extrabold">{activeProfile.name}</span></span>
                <span className="text-xl">{getProfileAvatarEmoji(activeProfile.avatar)}</span>
              </div>
            </div>

            {/* Active Game Sub-Module Injection */}
            <div className="py-2">
              {activeCategory === 'drawing' && (
                <DrawingCanvas
                  lang={lang}
                  onActivityComplete={handleActivityComplete}
                />
              )}

              {activeCategory === 'memory' && (
                <MemoryGame
                  difficulty={activeProfile.level}
                  lang={lang}
                  onActivityComplete={handleActivityComplete}
                />
              )}

              {activeCategory === 'math' && (
                <MathGame
                  key={activeProfile.levelNumber}
                  levelNumber={activeProfile.levelNumber}
                  lang={lang}
                  onActivityComplete={handleActivityComplete}
                  onNextLevel={() => {
                    console.log("Next level button clicked!");
                  }}
                />
              )}

              {activeCategory === 'english' && (
                <EnglishGame
                  difficulty={activeProfile.level}
                  lang={lang}
                  onActivityComplete={handleActivityComplete}
                />
              )}

              {activeCategory === 'science' && (
                <ScienceGame
                  difficulty={activeProfile.level}
                  lang={lang}
                  onActivityComplete={handleActivityComplete}
                />
              )}

              {activeCategory === 'gk' && (
                <GKGame
                  difficulty={activeProfile.level}
                  lang={lang}
                  onActivityComplete={handleActivityComplete}
                />
              )}

              {activeCategory === 'puzzle' && (
                <LogicPuzzle
                  difficulty={activeProfile.level}
                  lang={lang}
                  onActivityComplete={handleActivityComplete}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: PARENT SECURITY ADMIN DASHBOARD SCREEN */}
        {currentView === 'parent' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                AudioEngine.playClick();
                if (activeProfile) setCurrentView('dashboard');
                else setCurrentView('profile-select');
              }}
              id="parent-dashboard-back-btn"
              className="cartoon-btn bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 text-xs flex items-center gap-1 cursor-pointer self-start"
            >
              <Home className="w-4 h-4" /> {activeProfile ? "Back to Dashboard" : "Back to Profiles"}
            </button>

            <ParentDashboard
              profiles={profiles}
              lang={lang}
              onDeleteProfile={handleDeleteProfile}
              onAddCustomQuestion={handleAddCustomQuestion}
              customQuestions={customQuestions}
              onDeleteCustomQuestion={handleDeleteCustomQuestion}
            />
          </div>
        )}
      </main>

      {/* Persistent Static Sponsor Ad Unit at bottom edge of application container */}
      <footer className="mt-12 max-w-4xl mx-auto px-4 border-t border-slate-200 pt-6">
        <AdBanner />
        <div className="text-center text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
          &copy; 2026 KidQuest Academy. Safeguarded for Children aged 5–12.
        </div>
      </footer>
    </div>
  );
}
