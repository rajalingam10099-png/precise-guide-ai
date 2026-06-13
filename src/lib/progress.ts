// Module 8: Progress Tracking. Tracks ONLY:
// - Completed Lessons
// - Quiz Scores
// - Pronunciation Scores
// Nothing else (per requirements).

export type ProgressData = {
  completedLessons: string[]; // lesson item ids
  quizScores: { at: number; difficulty: string; score: number; total: number }[];
  pronunciationScores: { at: number; word: string; score: number }[];
};

const KEY = "kural.progress.v1";

function empty(): ProgressData {
  return { completedLessons: [], quizScores: [], pronunciationScores: [] };
}

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...(JSON.parse(raw) as Partial<ProgressData>) } as ProgressData;
  } catch {
    return empty();
  }
}

export function saveProgress(p: ProgressData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

export function markLessonComplete(id: string) {
  const p = loadProgress();
  if (!p.completedLessons.includes(id)) {
    p.completedLessons.push(id);
    saveProgress(p);
  }
}

export function recordQuizScore(difficulty: string, score: number, total: number) {
  const p = loadProgress();
  p.quizScores.push({ at: Date.now(), difficulty, score, total });
  saveProgress(p);
}

export function recordPronunciationScore(word: string, score: number) {
  const p = loadProgress();
  p.pronunciationScores.push({ at: Date.now(), word, score });
  saveProgress(p);
}
