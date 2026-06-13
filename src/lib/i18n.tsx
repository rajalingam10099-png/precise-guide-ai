import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Multilingual support (Module 7). Interface languages per spec: English, Hindi.
// Tamil is the content being taught.
export type UiLang = "en" | "hi";

type Dict = Record<string, string>;

const en: Dict = {
  app_name: "Kural AI",
  tagline: "Learn Tamil the joyful way",
  pick_language: "Choose your language",
  english: "English",
  hindi: "हिंदी (Hindi)",
  continue: "Continue",
  home: "Home",
  uyir: "Uyir Ezhuthu",
  uyir_desc: "Tamil vowels",
  mei: "Mei Ezhuthu",
  mei_desc: "Tamil consonants",
  word_builder: "Word Builder",
  word_builder_desc: "Build Tamil words",
  pronunciation: "Pronunciation Practice",
  pronunciation_desc: "Speak & get a score",
  quiz: "Quiz",
  quiz_desc: "Test what you learned",
  progress: "Progress",
  progress_desc: "Your learning so far",
  back: "Back",
  next: "Next",
  previous: "Previous",
  listen: "Listen",
  repeat: "Say it",
  recording: "Listening…",
  score: "Score",
  feedback: "Feedback",
  try_again: "Try again",
  letter: "Letter",
  word: "Word",
  meaning_en: "English meaning",
  meaning_hi: "Hindi meaning",
  ai_tutor: "AI Tutor",
  tutor_hello: "Hi! I am your Tamil tutor. Tap a lesson to begin.",
  difficulty: "Difficulty",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  correct: "Correct! 🎉",
  wrong: "Not quite. The answer was",
  start_quiz: "Start Quiz",
  finish: "Finish",
  what_image: "What is this?",
  build_word: "Tap letters to build the word",
  check: "Check",
  reset: "Reset",
  completed_lessons: "Completed Lessons",
  quiz_scores: "Quiz Scores",
  pronunciation_scores: "Pronunciation Scores",
  no_data_yet: "No data yet. Start learning!",
  ask_tutor: "Ask the tutor",
  ask_placeholder: "Ask about a letter, word, or pronunciation…",
  send: "Send",
  speech_unsupported: "Speech recognition isn't supported in this browser.",
  language: "Language",
};

const hi: Dict = {
  app_name: "कुरल AI",
  tagline: "खुशी से तमिल सीखें",
  pick_language: "अपनी भाषा चुनें",
  english: "English",
  hindi: "हिंदी",
  continue: "आगे बढ़ें",
  home: "होम",
  uyir: "उयिर एऴुत्तु",
  uyir_desc: "तमिल स्वर",
  mei: "मेइ एऴुत्तु",
  mei_desc: "तमिल व्यंजन",
  word_builder: "शब्द निर्माता",
  word_builder_desc: "तमिल शब्द बनाएँ",
  pronunciation: "उच्चारण अभ्यास",
  pronunciation_desc: "बोलें और स्कोर पाएँ",
  quiz: "प्रश्नोत्तरी",
  quiz_desc: "जो सीखा उसे जाँचें",
  progress: "प्रगति",
  progress_desc: "आपकी अब तक की सीख",
  back: "वापस",
  next: "अगला",
  previous: "पिछला",
  listen: "सुनें",
  repeat: "बोलें",
  recording: "सुन रहा हूँ…",
  score: "स्कोर",
  feedback: "प्रतिक्रिया",
  try_again: "फिर कोशिश करें",
  letter: "अक्षर",
  word: "शब्द",
  meaning_en: "अंग्रेज़ी अर्थ",
  meaning_hi: "हिंदी अर्थ",
  ai_tutor: "AI शिक्षक",
  tutor_hello: "नमस्ते! मैं आपका तमिल शिक्षक हूँ। एक पाठ चुनें।",
  difficulty: "कठिनाई",
  easy: "आसान",
  medium: "मध्यम",
  hard: "कठिन",
  correct: "सही! 🎉",
  wrong: "गलत। सही उत्तर था",
  start_quiz: "प्रश्नोत्तरी शुरू करें",
  finish: "समाप्त करें",
  what_image: "यह क्या है?",
  build_word: "अक्षरों पर टैप करके शब्द बनाएँ",
  check: "जाँचें",
  reset: "रीसेट",
  completed_lessons: "पूर्ण पाठ",
  quiz_scores: "प्रश्नोत्तरी स्कोर",
  pronunciation_scores: "उच्चारण स्कोर",
  no_data_yet: "अभी कोई डेटा नहीं। सीखना शुरू करें!",
  ask_tutor: "शिक्षक से पूछें",
  ask_placeholder: "अक्षर, शब्द या उच्चारण के बारे में पूछें…",
  send: "भेजें",
  speech_unsupported: "इस ब्राउज़र में वाक्-पहचान समर्थित नहीं है।",
  language: "भाषा",
};

const dicts: Record<UiLang, Dict> = { en, hi };

type I18nCtx = { lang: UiLang; setLang: (l: UiLang) => void; t: (k: keyof typeof en) => string };
const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("kural.lang") as UiLang | null;
    if (saved === "en" || saved === "hi") setLangState(saved);
  }, []);

  const setLang = (l: UiLang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("kural.lang", l);
  };

  const t = (k: keyof typeof en) => dicts[lang][k] ?? en[k];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
