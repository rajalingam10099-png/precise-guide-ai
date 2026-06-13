import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Mic, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { listLessons, markLessonComplete } from "@/lib/lessons.functions";
import { submitPronunciation } from "@/lib/pronunciation.functions";
import { getSpeechProvider } from "@/services/speech";
import { getTtsProvider } from "@/services/tts";

type LessonItem = {
  id: string;
  module: "uyir" | "mei";
  letter: string;
  word: string;
  english: string;
  hindi: string;
  emoji: string;
};

// Screen 4: Lesson Screen. Implements Modules 1 (Uyir) and 2 (Mei).
// Flow per requirements: show letter, image, AI tutor pronounces word, user
// repeats, system evaluates, show score, show feedback.

export const Route = createFileRoute("/lesson/$module")({
  head: ({ params }) => {
    const isUyir = params.module === "uyir";
    const title = isUyir ? "Uyir Ezhuthu — Tamil Vowels" : "Mei Ezhuthu — Tamil Consonants";
    return {
      meta: [
        { title: `${title} — Kural AI` },
        { name: "description", content: `Learn Tamil ${isUyir ? "vowels (Uyir Ezhuthu)" : "consonants (Mei Ezhuthu)"} with images, audio and an AI tutor.` },
      ],
    };
  },
  loader: ({ params }) => {
    if (params.module !== "uyir" && params.module !== "mei") throw notFound();
    return null;
  },
  component: LessonScreen,
});

function LessonScreen() {
  const { module } = Route.useParams();
  const { t, lang } = useI18n();
  const fetchLessons = useServerFn(listLessons);
  const markComplete = useServerFn(markLessonComplete);
  const submitPron = useServerFn(submitPronunciation);
  const { data: all = [] } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => fetchLessons(),
  });
  const items = useMemo<LessonItem[]>(
    () => (all as LessonItem[]).filter((l) => l.module === module),
    [all, module],
  );
  const [idx, setIdx] = useState(0);
  const item = items[idx];
  const [feedback, setFeedback] = useState<{ score: number; ok: boolean; miss: string } | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => setSupported(getSpeechProvider().isSupported()), []);
  useEffect(() => {
    if (!item) return;
    setFeedback(null);
    markComplete({ data: { lessonId: item.id } }).catch(() => {});
    const tm = setTimeout(() => void getTtsProvider().speak(item.word, "ta-IN"), 350);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  async function record() {
    if (!supported || !item) return;
    setListening(true);
    setFeedback(null);
    try {
      const r = await getSpeechProvider().listenOnce("ta-IN");
      const s = await submitPron({ data: { word: item.word, transcript: r.transcript } });
      setFeedback({ score: s.pronunciation, ok: s.ok, miss: s.mispronounced });
    } catch {
      setFeedback({ score: 0, ok: false, miss: item?.word ?? "" });
    } finally {
      setListening(false);
    }
  }

  if (!item) {
    return (
      <AppShell title={module === "uyir" ? t("uyir") : t("mei")}>
        <div className="py-12 text-center text-muted-foreground">…</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={module === "uyir" ? t("uyir") : t("mei")} context={`Lesson: ${item.letter} (${item.word}) = ${item.english}`}>
      <div className="mb-4 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <Link to="/home" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
        </Link>
        <span>{idx + 1} / {items.length}</span>
      </div>

      <article className="overflow-hidden rounded-3xl border-2 border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="grid place-items-center p-8" style={{ background: "var(--gradient-sky)" }}>
          <div className="text-9xl tamil text-foreground">{item.letter}</div>
          <div className="mt-4 text-7xl">{item.emoji}</div>
        </div>
        <div className="space-y-3 p-6">
          <div className="flex items-baseline justify-between">
            <p className="text-4xl font-black tamil">{item.word}</p>
            <button
              onClick={() => void getTtsProvider().speak(item.word, "ta-IN")}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Volume2 className="h-4 w-4" /> {t("listen")}
            </button>
          </div>
          <Row label={t("meaning_en")} value={item.english} />
          <Row label={t("meaning_hi")} value={item.hindi} hindi />

          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("repeat")}</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={record}
                disabled={!supported || listening}
                className="inline-flex items-center gap-2 rounded-full bg-tutor px-4 py-2 text-sm font-bold text-tutor-foreground disabled:opacity-60"
              >
                <Mic className="h-4 w-4" /> {listening ? t("recording") : t("repeat")}
              </button>
              {!supported && <p className="text-xs font-semibold text-destructive">{t("speech_unsupported")}</p>}
            </div>
            {feedback && (
              <div className={`mt-3 rounded-xl p-3 text-sm font-bold ${feedback.ok ? "bg-success/20 text-foreground" : "bg-destructive/15 text-foreground"}`}>
                <p>{t("score")}: {feedback.score}/100</p>
                {!feedback.ok && (
                  <p className="mt-1 font-semibold">
                    {t("feedback")}: <span className="tamil">{feedback.miss}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </article>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" /> {t("previous")}
        </button>
        <button
          onClick={() => setIdx((i) => Math.min(items.length - 1, i + 1))}
          disabled={idx === items.length - 1}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {t("next")} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AppShell>
  );
}

function Row({ label, value, hindi }: { label: string; value: string; hindi?: boolean }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-2">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold ${hindi ? "hindi" : ""}`}>{value}</span>
    </div>
  );
}
