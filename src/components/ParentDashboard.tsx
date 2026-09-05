import React, { useState, useEffect } from 'react';
import { ShieldCheck, BarChart3, Users, Settings, Plus, Trash2, CheckCircle, ShieldAlert, Star, BookOpen } from 'lucide-react';
import { AudioEngine } from './AudioEngine';
import { Profile, QuizQuestion } from '../types/game';
import { TRANSLATIONS } from '../data/questions';

interface ParentDashboardProps {
  profiles: Profile[];
  lang: 'en' | 'es' | 'fr';
  onDeleteProfile: (id: string) => void;
  onAddCustomQuestion: (question: QuizQuestion) => void;
  customQuestions: QuizQuestion[];
  onDeleteCustomQuestion: (id: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profiles,
  lang,
  onDeleteProfile,
  onAddCustomQuestion,
  customQuestions,
  onDeleteCustomQuestion
}) => {
  const [isLocked, setIsLocked] = useState(true);
  const [gateQuestion, setGateQuestion] = useState({ num1: 0, num2: 0, ans: 0 });
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'profiles' | 'content'>('analytics');

  // Custom question form state
  const [category, setCategory] = useState<'math' | 'science' | 'gk' | 'english'>('gk');
  const [questionEn, setQuestionEn] = useState('');
  const [optionsEn, setOptionsEn] = useState(['', '', '', '']);
  const [answerEn, setAnswerEn] = useState('');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Generate parent security question (e.g. 7 x 8)
    const num1 = Math.floor(Math.random() * 5) + 5; // 5-9
    const num2 = Math.floor(Math.random() * 4) + 6; // 6-9
    setGateQuestion({ num1, num2, ans: num1 * num2 });
  }, []);

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateAnswer) === gateQuestion.ans) {
      AudioEngine.playSuccess();
      setIsLocked(false);
      setGateError(false);
    } else {
      AudioEngine.playError();
      setGateError(true);
      setGateAnswer('');
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionEn || optionsEn.some(opt => !opt) || !answerEn) {
      alert("Please fill in all options and answer field!");
      return;
    }

    const newQ: QuizQuestion = {
      id: 'custom_' + Date.now(),
      category,
      difficulty: 'medium', // Default to medium difficulty for custom questions
      questionEn,
      questionEs: questionEn, // fallback for multilingual fields
      questionFr: questionEn,
      optionsEn,
      optionsEs: optionsEn,
      optionsFr: optionsEn,
      answerEn,
      answerEs: answerEn,
      answerFr: answerEn,
      funFactEn: "This is a custom question created by your parent!",
      funFactEs: "¡Esta es una pregunta personalizada creada por tus padres!",
      funFactFr: "Il s'agit d'une question personnalisée créée par votre parent !"
    };

    AudioEngine.playSuccess();
    onAddCustomQuestion(newQ);

    // Reset form
    setQuestionEn('');
    setOptionsEn(['', '', '', '']);
    setAnswerEn('');
  };

  if (isLocked) {
    return (
      <div className="cartoon-card p-6 bg-indigo-50/50 max-w-md mx-auto text-center">
        <ShieldAlert className="w-12 h-12 text-indigo-500 mx-auto animate-bounce mb-2" />
        <h3 className="text-xl font-bold text-slate-800">
          {t.parentLockTitle}
        </h3>
        <p className="text-xs font-semibold text-slate-500 mt-1 mb-4 leading-relaxed">
          {t.parentLockDesc}
        </p>

        <form onSubmit={handleGateSubmit} className="flex flex-col gap-3">
          <div className="text-2xl font-extrabold text-indigo-600 bg-white border-2 border-slate-900 py-3 rounded-xl">
            {gateQuestion.num1} &times; {gateQuestion.num2} = ?
          </div>

          <input
            type="number"
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value)}
            id="parental-gate-input"
            required
            placeholder="Your answer..."
            className="w-full text-center py-2.5 font-bold text-slate-800 border-2 border-slate-900 rounded-xl"
            autoFocus
          />

          {gateError && (
            <p className="text-xs font-bold text-rose-500">
              {t.parentLockIncorrect}
            </p>
          )}

          <button
            type="submit"
            id="parental-gate-submit-btn"
            className="cartoon-btn bg-indigo-500 text-white hover:bg-indigo-600 font-bold py-2.5 mt-1"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="cartoon-card p-6 bg-white max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-100 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-500" />
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {t.dashboard}
            </h3>
            <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest block">
              Admin & Progress Panel
            </span>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => { AudioEngine.playClick(); setActiveTab('analytics'); }}
            id="tab-analytics"
            className={`flex-1 sm:flex-none px-3 py-1.5 font-bold text-xs cartoon-btn flex items-center gap-1 ${
              activeTab === 'analytics' ? 'bg-indigo-400 text-white' : 'bg-slate-50 text-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => { AudioEngine.playClick(); setActiveTab('profiles'); }}
            id="tab-profiles"
            className={`flex-1 sm:flex-none px-3 py-1.5 font-bold text-xs cartoon-btn flex items-center gap-1 ${
              activeTab === 'profiles' ? 'bg-indigo-400 text-white' : 'bg-slate-50 text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Profiles
          </button>
          <button
            onClick={() => { AudioEngine.playClick(); setActiveTab('content'); }}
            id="tab-content"
            className={`flex-1 sm:flex-none px-3 py-1.5 font-bold text-xs cartoon-btn flex items-center gap-1 ${
              activeTab === 'content' ? 'bg-indigo-400 text-white' : 'bg-slate-50 text-slate-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Lessons
          </button>
        </div>
      </div>

      {/* SECTION 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">
            {t.analytics}
          </h4>

          {profiles.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No progress tracked yet. Create child profiles to begin!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((p) => (
                <div key={p.id} className="border-2 border-slate-900 rounded-2xl p-4 bg-slate-50 flex flex-col gap-3 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="font-extrabold text-slate-800 text-base">{p.name} ({p.age} y/o)</span>
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-yellow-200">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" /> {p.stars} Stars
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase block text-[9px]">Activity History</span>
                      <span className="text-sm font-extrabold text-indigo-600 mt-0.5 block">{p.history.length} Quests completed</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase block text-[9px]">Achievements</span>
                      <span className="text-sm font-extrabold text-pink-500 mt-0.5 block">{p.badges.length} Badges earned</span>
                    </div>
                  </div>

                  {/* Lessons list */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Lesson Checklist</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['math', 'english', 'science', 'gk', 'memory', 'drawing'].map((sub) => {
                        const hasDone = p.history.some(h => h.category === sub);
                        return (
                          <span
                            key={sub}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                              hasDone 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            <CheckCircle className={`w-3 h-3 ${hasDone ? 'text-emerald-500' : 'text-slate-300'}`} />
                            {sub.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PROFILES */}
      {activeTab === 'profiles' && (
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">
            Manage Child Profiles
          </h4>

          {profiles.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No active profiles.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {profiles.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 border-2 border-slate-900 rounded-xl bg-amber-50/20">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-base">{p.name}</span>
                    <span className="text-xs text-slate-500">Difficulty: {p.level.toUpperCase()} | Age: {p.age}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete profile for ${p.name}?`)) {
                        AudioEngine.playClick();
                        onDeleteProfile(p.id);
                      }
                    }}
                    id={`delete-profile-btn-${p.id}`}
                    className="cartoon-btn bg-rose-100 hover:bg-rose-200 text-rose-600 px-3 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {t.delete}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: MANAGE CONTENT */}
      {activeTab === 'content' && (
        <div className="flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4">
            <h4 className="font-bold text-sm text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Plus className="w-4 h-4" /> {t.addCustomQuestion}
            </h4>

            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Subject</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    id="custom-q-category"
                    className="w-full bg-white border-2 border-slate-900 rounded-xl p-2 font-semibold text-sm"
                  >
                    <option value="gk">General Knowledge</option>
                    <option value="math">Mathematics</option>
                    <option value="science">Space Lab Science</option>
                    <option value="english">Spelling/English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={answerEn}
                    onChange={(e) => setAnswerEn(e.target.value)}
                    id="custom-q-answer"
                    required
                    placeholder="Exact correct answer string..."
                    className="w-full bg-white border-2 border-slate-900 rounded-xl p-2 font-semibold text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Question Text</label>
                <input
                  type="text"
                  value={questionEn}
                  onChange={(e) => setQuestionEn(e.target.value)}
                  id="custom-q-text"
                  required
                  placeholder="e.g., Which animal lays the biggest eggs?"
                  className="w-full bg-white border-2 border-slate-900 rounded-xl p-2.5 font-semibold text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Answers Options (4 options, must include correct answer)</label>
                <div className="grid grid-cols-2 gap-2">
                  {optionsEn.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...optionsEn];
                        updated[i] = e.target.value;
                        setOptionsEn(updated);
                      }}
                      id={`custom-q-option-${i}`}
                      required
                      placeholder={`Option ${i + 1}`}
                      className="bg-white border-2 border-slate-900 rounded-xl p-1.5 font-semibold text-xs text-slate-800"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="add-custom-question-submit"
                className="cartoon-btn bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold py-2 px-4 text-xs mt-1 self-start flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Save Custom Question
              </button>
            </form>
          </div>

          {/* List of custom questions */}
          <div>
            <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-pink-500" />
              {t.customQuestionsList} ({customQuestions.length})
            </h4>

            {customQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No custom lessons written yet. Create some above to insert them into learning games!</p>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {customQuestions.map((q) => (
                  <div key={q.id} className="flex justify-between items-center p-2 border border-slate-200 rounded-xl text-xs bg-slate-50">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-700">{q.questionEn}</span>
                      <span className="text-[10px] font-semibold text-indigo-500 uppercase">
                        Category: {q.category} | Ans: {q.answerEn}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        AudioEngine.playClick();
                        onDeleteCustomQuestion(q.id);
                      }}
                      id={`delete-custom-q-btn-${q.id}`}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
