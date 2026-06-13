import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { allLessons } from "@/data/tamil";
import { useI18n } from "@/lib/i18n";
import { loadProgress, type ProgressData } from "@/lib/progress";

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
  const [data, setData] = useState<ProgressData | null>(null);
  useEffect(() => setData(loadProgress()), []);

  if (!data) return <AppShell title={t("progress")}>…</AppShell>;

  const completedTitles = data.completedLessons
    .map((id) => allLessons.find((l) => l.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const empty = completedTitles.length === 0 && data.quizScores.length === 0 && data.pronunciationScores.length === 0;

  return (
    <AppShell title={t("progress")}>
      {empty && (
        <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
          {t("no_data_yet")}
        </div>
      )}

      {!empty && (
        <div className="grid gap-4">
          <Card title={t("completed_lessons")} count={completedTitles.length}>
            <div className="flex flex-wrap gap-2">
              {completedTitles.map((l) => (
                <span key={l.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-sm font-bold">
                  <span className="tamil">{l.letter}</span> · <span className="tamil">{l.word}</span>
                </span>
              ))}
            </div>
          </Card>

          <Card title={t("quiz_scores")} count={data.quizScores.length}>
            <ul className="space-y-1 text-sm font-semibold">
              {data.quizScores.slice().reverse().slice(0, 10).map((q, i) => (
                <li key={i} className="flex items-center justify-between border-b border-border/40 py-1">
                  <span className="capitalize">{q.difficulty}</span>
                  <span>{q.score} / {q.total}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={t("pronunciation_scores")} count={data.pronunciationScores.length}>
            <ul className="space-y-1 text-sm font-semibold">
              {data.pronunciationScores.slice().reverse().slice(0, 10).map((p, i) => (
                <li key={i} className="flex items-center justify-between border-b border-border/40 py-1">
                  <span className="tamil">{p.word}</span>
                  <span>{p.score}/100</span>
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
