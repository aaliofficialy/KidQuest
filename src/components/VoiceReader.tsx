import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types/game';
import { AudioEngine } from './AudioEngine';

interface VoiceReaderProps {
  text: string;
  lang: Language;
  label?: string;
}

export const VoiceReader: React.FC<VoiceReaderProps> = ({ text, lang, label }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    // Stop speaking when the text or component changes
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, lang]);

  const speak = () => {
    if (!isSupported) return;

    AudioEngine.playClick();

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop anything else

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate language code
    switch (lang) {
      case 'es':
        utterance.lang = 'es-ES';
        break;
      case 'fr':
        utterance.lang = 'fr-FR';
        break;
      default:
        utterance.lang = 'en-US';
    }

    // Attempt to select a voice with the requested language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Adjust rate and pitch to be kid-friendly and highly clear
    utterance.rate = 0.85; // Slightly slower
    utterance.pitch = 1.1; // Slightly higher/friendly

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <button
      onClick={speak}
      type="button"
      id="voice-read-btn"
      className={`cartoon-btn flex items-center justify-center gap-2 px-4 py-2 font-bold text-sm transition ${
        isSpeaking 
          ? 'bg-amber-400 text-slate-900 border-amber-500 scale-95' 
          : 'bg-white hover:bg-amber-50 text-slate-800'
      }`}
      title="Speak aloud"
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-5 h-5 animate-pulse text-red-500" />
          <span>{label || "Stop"}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-indigo-500 animate-bounce" />
          <span>{label || "Read Aloud"}</span>
        </>
      )}
    </button>
  );
};
