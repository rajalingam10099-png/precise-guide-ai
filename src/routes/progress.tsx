import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { getProgress } from "@/lib/progress.functions";

type CompletedRow = { lesson_id: string; completed_at: string; lessons: { letter: string; word: string; module: string } | null };
type QuizRow = { difficulty: string; score: number; total: number; taken_at: string };
type PronRow = { word: string; accuracy: number; pronunciation: number; mispronounced: string | null; recorded_at: string };

// Screen 7 + Module 8: Progress. Shows ONLY:
// completed lessons, quiz scores, pronunciation scores.
export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Kural AI" },
      { name: "description", content: "Track completed Tamil lessons, quiz scores and pronunciation scores." },
    ],
  }),
  component: ProgressScreen,
});

function ProgressScreen() {
  const { t } = useI18n();
  const fetchProgress = useServerFn(getProgress);
  const { data, isLoading } = useQuery({ queryKey: ["progress"], queryFn: () => fetchProgress() });

  if (isLoading || !data) {
    return <AppShell title={t("progress")}><div className="py-12 text-center text-muted-foreground">…</div></AppShell>;
  }

  const completed = data.completedLessons as CompletedRow[];
  const quizzes = data.quizScores as QuizRow[];
  const prons = data.pronunciationScores as PronRow[];
  const empty = completed.length === 0 && quizzes.length === 0 && prons.length === 0;

  return (
    <AppShell title={t("progress")}>
      {empty && (
        <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
          {t("no_data_yet")}
        </div>
      )}

      {!empty && (
        <div className="grid gap-4">
          <Card title={t("completed_lessons")} count={completed.length}>
            <div className="flex flex-wrap gap-2">
              {completed.map((row) =>
                row.lessons ? (
                  <span key={row.lesson_id} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-sm font-bold">
                    <span className="tamil">{row.lessons.letter}</span> · <span className="tamil">{row.lessons.word}</span>
                  </span>
                ) : null,
              )}
            </div>
          </Card>

          <Card title={t("quiz_scores")} count={quizzes.length}>
            <ul className="space-y-1 text-sm font-semibold">
              {quizzes.slice(0, 10).map((q, i) => (
                <li key={i} className="flex items-center justify-between border-b border-border/40 py-1">
                  <span className="capitalize">{q.difficulty}</span>
                  <span>{q.score} / {q.total}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={t("pronunciation_scores")} count={prons.length}>
            <ul className="space-y-1 text-sm font-semibold">
              {prons.slice(0, 10).map((p, i) => (
                <li key={i} className="flex items-center justify-between border-b border-border/40 py-1">
                  <span className="tamil">{p.word}</span>
                  <span>{p.pronunciation}/100</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Card({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border-2 border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black">{title}</h2>
        <span className="rounded-full bg-primary px-3 py-0.5 text-sm font-black text-primary-foreground">{count}</span>
      </div>
      {children}
    </section>
  );
}
