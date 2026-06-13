// Browser Web Speech API helpers — Tamil TTS + speech recognition for
// Module 4 (Pronunciation Checker) and Module 5 (AI Tutor voice).

export function speak(text: string, lang = "ta-IN") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((v) => v.lang?.toLowerCase().startsWith("ta")) ?? voices.find((v) => v.lang === lang);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export type RecognitionResult = { transcript: string; confidence: number };

export function isRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
  );
}

export function listenOnce(lang = "ta-IN"): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SR) return reject(new Error("unsupported"));
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: SpeechRecognitionEventLike) => {
      const r = e.results[0]?.[0];
      resolve({ transcript: r?.transcript ?? "", confidence: r?.confidence ?? 0 });
    };
    rec.onerror = (e: { error?: string }) => reject(new Error(e.error ?? "error"));
    rec.onend = () => {};
    rec.start();
  });
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: SpeechRecognitionEventLike) => void;
  onerror: (e: { error?: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  results: Array<Array<{ transcript: string; confidence: number }>>;
};

// Pronunciation scoring (Module 4): compare transcript vs target.
// Outputs accuracy %, pronunciation score, and the mispronounced portion.
export function scorePronunciation(target: string, spoken: string) {
  const t = target.trim();
  const s = spoken.trim();
  if (!s) return { accuracy: 0, pronunciation: 0, mispronounced: t, ok: false };
  const distance = levenshtein(t, s);
  const maxLen = Math.max(t.length, s.length, 1);
  const accuracy = Math.round(((maxLen - distance) / maxLen) * 100);
  const pronunciation = Math.min(100, Math.round(accuracy * 0.9 + (s === t ? 10 : 0)));
  const mispronounced = diffSegment(t, s);
  return { accuracy, pronunciation, mispronounced, ok: accuracy >= 70 };
}

function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function diffSegment(target: string, spoken: string) {
  let i = 0;
  while (i < target.length && i < spoken.length && target[i] === spoken[i]) i++;
  return target.slice(i) || "—";
}
