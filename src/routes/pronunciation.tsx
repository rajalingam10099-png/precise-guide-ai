import { createFileRoute } from "@tanstack/react-router";
import { Mic, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { allLessons } from "@/data/tamil";
import { useI18n } from "@/lib/i18n";
import { recordPronunciationScore } from "@/lib/progress";
import { isRecognitionSupported, listenOnce, scorePronunciation, speak } from "@/lib/speech";

// Screen 5 + Module 4: Pronunciation Checker.
// Output per spec: Accuracy Score, Pronunciation Score, Mispronounced Portion, Correction Feedback.
export const Route = createFileRoute("/pronunciation")({
  head: () => ({
    meta: [
      { title: "Pronunciation Practice — Kural AI" },
      { name: "description", content: "Speak Tamil words and get an accuracy and pronunciation score with correction feedback." },
    ],
  }),
  component: PronunciationScreen,
});

function PronunciationScreen() {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const item = allLessons[idx];
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<{ accuracy: number; pronunciation: number; mispronounced: string; transcript: string } | null>(null);

  useEffect(() => setSupported(isRecognitionSupported()), []);

  function nextWord() {
    setIdx((i) => (i + 1) % allLessons.length);
    setResult(null);
  }

  async function record() {
    if (!supported) return;
    setListening(true);
    setResult(null);
    try {
      const r = await listenOnce("ta-IN");
      const s = scorePronunciation(item.word, r.transcript);
      setResult({ accuracy: s.accuracy, pronunciation: s.pronunciation, mispronounced: s.mispronounced, transcript: r.transcript });
      recordPronunciationScore(item.word, s.pronunciation);
    } catch {
      setResult({ accuracy: 0, pronunciation: 0, mispronounced: item.word, transcript: "" });
    } finally {
      setListening(false);
    }
  }

  return (
    <AppShell title={t("pronunciation")} context={`Pronouncing: ${item.word} (${item.english})`}>
      <article className="rounded-3xl border-2 border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="grid place-items-center rounded-2xl p-6" style={{ background: "var(--gradient-sun)" }}>
          <div className="text-8xl tamil">{item.word}</div>
          <div className="mt-2 text-5xl">{item.emoji}</div>
        </div>
        <p className="mt-3 text-center text-sm font-bold text-muted-foreground">
          {item.english} · <span className="hindi">{item.hindi}</span>
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => speak(item.word)} className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold">
            <Volume2 className="h-4 w-4" /> {t("listen")}
          </button>
          <button
            onClick={record}
            disabled={!supported || listening}
            className="inline-flex items-center gap-2 rounded-full bg-tutor px-5 py-3 text-base font-black text-tutor-foreground shadow-[var(--shadow-soft)] disabled:opacity-50"
          >
            <Mic className="h-5 w-5" /> {listening ? t("recording") : t("repeat")}
          </button>
        </div>

        {!supported && <p className="mt-3 text-center text-sm font-semibold text-destructive">{t("speech_unsupported")}</p>}

        {result && (
          <div className="mt-5 grid gap-3">
            <ScoreBar label="Accuracy" value={result.accuracy} />
            <ScoreBar label="Pronunciation" value={result.pronunciation} />
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("feedback")}</p>
              <p className="mt-1 text-sm font-bold">
                Mispronounced: <span className="tamil text-destructive">{result.mispronounced}</span>
              </p>
              <p className="text-xs font-semibold text-muted-foreground">You said: <span className="tamil">{result.transcript || "—"}</span></p>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={nextWord} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            {t("next")}
          </button>
        </div>
      </article>
    </AppShell>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
